// src/lib/profile-pipeline/validator.ts
// Profile Validator - Checks data quality, verifies links, cross-references sources

import { ValidationResult, ProfileFlag } from './types';
import { AggregatedProfile } from '../api-providers/aggregator';

export class ProfileValidator {
  
  // Main validation method
  async validate(profile: AggregatedProfile): Promise<{
    validation: ValidationResult;
    flags: ProfileFlag[];
  }> {
    console.log(`🔍 Validating profile for: ${profile.name}`);
    
    const checks: ValidationResult['checks'] = [];
    const flags: ProfileFlag[] = [];
    const linkDetails: ValidationResult['links']['details'] = [];
    
    // ========================================
    // 1. REQUIRED FIELDS CHECK
    // ========================================
    
    // Name is required
    if (!profile.name || profile.name.trim().length < 2) {
      checks.push({
        name: 'name_present',
        passed: false,
        message: 'Name is missing or too short',
        severity: 'error',
      });
      flags.push(this.createFlag('missing_data', 'high', 'name', 'Profile name is missing'));
    } else {
      checks.push({
        name: 'name_present',
        passed: true,
        message: 'Name is present',
        severity: 'info',
      });
    }
    
    // Bio check
    if (!profile.bio.full || profile.bio.full.length < 50) {
      checks.push({
        name: 'bio_quality',
        passed: false,
        message: 'Bio is missing or too short (< 50 chars)',
        severity: 'warning',
      });
      flags.push(this.createFlag('missing_data', 'medium', 'bio', 'Bio is missing or incomplete'));
    } else {
      checks.push({
        name: 'bio_quality',
        passed: true,
        message: `Bio present (${profile.bio.full.length} chars)`,
        severity: 'info',
      });
    }
    
    // Image check
    if (!profile.images.primary) {
      checks.push({
        name: 'image_present',
        passed: false,
        message: 'No profile image found',
        severity: 'warning',
      });
      flags.push(this.createFlag('missing_data', 'medium', 'image', 'No profile image available'));
    } else {
      checks.push({
        name: 'image_present',
        passed: true,
        message: `Image found from ${profile.images.primarySource}`,
        severity: 'info',
      });
    }
    
    // ========================================
    // 2. DATA SOURCE CHECK
    // ========================================
    
    const sourceCount = profile.dataSources.length;
    
    if (sourceCount === 0) {
      checks.push({
        name: 'data_sources',
        passed: false,
        message: 'No data sources found',
        severity: 'error',
      });
      flags.push(this.createFlag('low_confidence', 'high', undefined, 'No external data sources could verify this profile'));
    } else if (sourceCount === 1) {
      checks.push({
        name: 'data_sources',
        passed: true,
        message: `Only 1 data source (${profile.dataSources[0]})`,
        severity: 'warning',
      });
      flags.push(this.createFlag('low_confidence', 'low', undefined, 'Profile based on single source - may need verification'));
    } else {
      checks.push({
        name: 'data_sources',
        passed: true,
        message: `${sourceCount} data sources found`,
        severity: 'info',
      });
    }
    
    // ========================================
    // 3. LINK VERIFICATION
    // ========================================
    
    const linksToCheck = [
      { name: 'youtube', url: profile.youtube.channelUrl },
      { name: 'podcast', url: profile.podcast.podcastUrl },
      { name: 'wikipedia', url: profile.wikipedia.url },
      { name: 'knowledge_graph', url: profile.knowledgeGraph.url },
    ].filter(l => l.url);
    
    let validLinks = 0;
    let invalidLinks = 0;
    
    for (const link of linksToCheck) {
      if (link.url) {
        const isValid = await this.checkLink(link.url);
        linkDetails.push({
          url: link.url,
          status: isValid ? 'valid' : 'invalid',
        });
        
        if (isValid) {
          validLinks++;
        } else {
          invalidLinks++;
          flags.push(this.createFlag('invalid_link', 'medium', link.name, `${link.name} link is broken: ${link.url}`));
        }
      }
    }
    
    checks.push({
      name: 'links_valid',
      passed: invalidLinks === 0,
      message: `${validLinks}/${linksToCheck.length} links valid`,
      severity: invalidLinks > 0 ? 'warning' : 'info',
    });
    
    // ========================================
    // 4. CROSS-REFERENCE CHECK
    // ========================================
    
    const conflicts: ValidationResult['crossReference']['conflicts'] = [];
    
    // Check if names match across sources
    const names = [
      profile.name,
      profile.displayName,
      profile.knowledgeGraph.found ? profile.knowledgeGraph.description?.split(',')[0] : null,
      profile.wikipedia.found ? profile.wikipedia.url?.split('/').pop()?.replace(/_/g, ' ') : null,
    ].filter(Boolean);
    
    const uniqueNames = new Set(names.map(n => n?.toLowerCase().trim()));
    if (uniqueNames.size > 2) {
      conflicts.push({
        field: 'name',
        sources: names.map((n, i) => ({ source: ['profile', 'display', 'knowledge_graph', 'wikipedia'][i], value: n })),
      });
      flags.push(this.createFlag('data_conflict', 'low', 'name', 'Name varies across sources'));
    }
    
    // ========================================
    // 5. CONTENT CHECK
    // ========================================
    
    // YouTube presence for public figures
    if (!profile.youtube.found) {
      checks.push({
        name: 'youtube_presence',
        passed: false,
        message: 'No YouTube channel found',
        severity: 'info', // Not an error, just info
      });
    } else {
      checks.push({
        name: 'youtube_presence',
        passed: true,
        message: `YouTube: ${profile.youtube.subscriberCountFormatted} subscribers`,
        severity: 'info',
      });
    }
    
    // Books check for scholars
    if (profile.books.totalBooks === 0) {
      checks.push({
        name: 'books_found',
        passed: false,
        message: 'No books found',
        severity: 'info',
      });
    } else {
      checks.push({
        name: 'books_found',
        passed: true,
        message: `${profile.books.totalBooks} books found`,
        severity: 'info',
      });
    }
    
    // ========================================
    // 6. CONFIDENCE CHECK
    // ========================================
    
    if (profile.dataQuality.score < 40) {
      checks.push({
        name: 'confidence_score',
        passed: false,
        message: `Low confidence score: ${profile.dataQuality.score}/100`,
        severity: 'warning',
      });
      flags.push(this.createFlag('low_confidence', 'medium', undefined, `Profile confidence is low (${profile.dataQuality.score}/100) - needs review`));
    } else {
      checks.push({
        name: 'confidence_score',
        passed: true,
        message: `Confidence score: ${profile.dataQuality.score}/100`,
        severity: 'info',
      });
    }
    
    // ========================================
    // COMPILE RESULTS
    // ========================================
    
    const checksPassed = checks.filter(c => c.passed).length;
    const checksFailed = checks.filter(c => !c.passed).length;
    
    const validation: ValidationResult = {
      isValid: checksFailed === 0 || !checks.some(c => !c.passed && c.severity === 'error'),
      checksPerformed: checks.length,
      checksPassed,
      checksFailed,
      checks,
      crossReference: {
        sourcesAgree: conflicts.length === 0,
        conflicts,
      },
      links: {
        total: linksToCheck.length,
        valid: validLinks,
        invalid: invalidLinks,
        unchecked: 0,
        details: linkDetails,
      },
    };
    
    console.log(`   ✅ Validation complete: ${checksPassed}/${checks.length} checks passed, ${flags.length} flags`);
    
    return { validation, flags };
  }
  
  // Check if a URL is accessible
  private async checkLink(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LammaBot/1.0)',
        },
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }
  
  // Create a flag object
  private createFlag(
    type: ProfileFlag['type'],
    severity: ProfileFlag['severity'],
    field: string | undefined,
    message: string
  ): ProfileFlag {
    return {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      field,
      message,
      createdAt: new Date().toISOString(),
    };
  }
}
