// src/lib/profile-pipeline/auto-pipeline.ts
// Automated Profile Pipeline - Main Orchestrator
// Integrates: Aggregator → Validator → Store (with auto-save)

import { ProfileAggregator, AggregatedProfile } from '../api-providers/aggregator';
import { ProfileValidator } from './validator';
import { ProfileStore } from './store';
import { PipelineResult, ProfileFlag } from './types';

// Minimum confidence score to auto-save
const MIN_CONFIDENCE_TO_SAVE = 40;

export class AutoPipeline {
  private aggregator: ProfileAggregator;
  private validator: ProfileValidator;
  private store: ProfileStore;

  constructor() {
    this.aggregator = new ProfileAggregator();
    this.validator = new ProfileValidator();
    this.store = new ProfileStore();
  }

  // ========================================
  // MAIN PIPELINE: Name → Collect → Validate → Store
  // ========================================

  async processProfile(name: string): Promise<PipelineResult> {
    const startTime = Date.now();
    console.log(`\n🚀 Auto-Pipeline: Processing "${name}"`);

    try {
      // Step 1: COLLECT from all APIs
      console.log('   📡 Step 1: Collecting from APIs...');
      const aggregated = await this.aggregator.aggregateProfile(name);

      if (!aggregated || !aggregated.name) {
        return this.createFailedResult(name, 'Failed to aggregate profile data', startTime);
      }

      // Step 2: VALIDATE data quality
      console.log('   🔍 Step 2: Validating data...');
      const { validation, flags } = await this.validator.validate(aggregated);

      // Step 3: DECIDE to save or not
      const confidence = aggregated.dataQuality;
      const shouldSave = confidence.score >= MIN_CONFIDENCE_TO_SAVE;

      if (!shouldSave) {
        console.log(`   ⚠️ Confidence too low (${confidence.score}%), skipping save`);
        return {
          success: false,
          creatorId: null,
          slug: null,
          action: 'skipped',
          confidence: { score: confidence.score, level: confidence.level },
          flags,
          dataSources: aggregated.dataSources,
          processingTimeMs: Date.now() - startTime,
          error: `Confidence score ${confidence.score} is below minimum ${MIN_CONFIDENCE_TO_SAVE}`,
        };
      }

      // Step 4: STORE with version history
      console.log('   💾 Step 3: Saving to Firestore...');
      const { creatorId, slug, version, isNew } = await this.store.saveProfile(
        aggregated,
        flags,
        'initial_creation' // Will be updated to 'auto_refresh' on subsequent saves
      );

      console.log(`   ✅ Complete! ${isNew ? 'Created' : 'Updated'} ${creatorId} (v${version})`);

      return {
        success: true,
        creatorId,
        slug,
        action: isNew ? 'created' : 'updated',
        confidence: { score: confidence.score, level: confidence.level },
        flags,
        dataSources: aggregated.dataSources,
        processingTimeMs: Date.now() - startTime,
      };

    } catch (error) {
      console.error('   ❌ Pipeline error:', error);
      return this.createFailedResult(name, String(error), startTime);
    }
  }

  // ========================================
  // BATCH PROCESSING
  // ========================================

  async processBatch(names: string[]): Promise<{
    summary: {
      total: number;
      successful: number;
      failed: number;
      flagged: number;
      profiles: { name: string; success: boolean; slug?: string; confidence?: { score: number; level: string } }[];
    };
    results: PipelineResult[];
  }> {
    const results: PipelineResult[] = [];
    const profiles: { name: string; success: boolean; slug?: string; confidence?: { score: number; level: string } }[] = [];

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      console.log(`\n📦 Batch [${i + 1}/${names.length}]: ${name}`);

      // Rate limiting between profiles
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const result = await this.processProfile(name);
      results.push(result);
      profiles.push({
        name,
        success: result.success,
        slug: result.slug || undefined,
        confidence: result.confidence,
      });
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const flagged = results.filter(r => r.flags.length > 0).length;

    return {
      summary: {
        total: names.length,
        successful,
        failed,
        flagged,
        profiles,
      },
      results,
    };
  }

  // ========================================
  // AUTO-REFRESH (for cron jobs)
  // ========================================

  async refreshStaleProfiles(limit = 10): Promise<{
    refreshed: number;
    results: PipelineResult[];
  }> {
    console.log(`\n🔄 Auto-Refresh: Checking for stale profiles...`);

    // Get profiles due for refresh
    const staleIds = await this.store.getProfilesDueForRefresh(limit);

    if (staleIds.length === 0) {
      console.log('   ✅ No stale profiles found');
      return { refreshed: 0, results: [] };
    }

    console.log(`   Found ${staleIds.length} profiles to refresh`);

    const results: PipelineResult[] = [];

    for (const creatorId of staleIds) {
      // Get the profile name from Firestore
      // For simplicity, we'll use the creatorId as the name (it's slug-formatted)
      const name = creatorId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      console.log(`   🔄 Refreshing: ${name}`);
      const result = await this.processProfile(name);
      results.push(result);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const refreshed = results.filter(r => r.success).length;
    console.log(`   ✅ Refreshed ${refreshed}/${staleIds.length} profiles`);

    return { refreshed, results };
  }

  // ========================================
  // FLAGGED PROFILES
  // ========================================

  async getFlaggedProfiles(): Promise<{ creatorId: string; name: string; flagCount: number }[]> {
    return await this.store.getProfilesWithFlags();
  }

  // ========================================
  // HELPERS
  // ========================================

  private createFailedResult(name: string, error: string, startTime: number): PipelineResult {
    return {
      success: false,
      creatorId: null,
      slug: null,
      action: 'failed',
      confidence: { score: 0, level: 'low' },
      flags: [],
      dataSources: [],
      processingTimeMs: Date.now() - startTime,
      error,
    };
  }
}
