"use client";

import { useState } from "react";
import { Plus, X, BarChart3, Users, Globe, BookOpen } from "lucide-react";
import Image from "next/image";
import { CREATORS } from "@/lib/data/creators";
import { Creator } from "@/lib/types/creator";
import CreatorCard from "@/components/ui/CreatorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  const [creator1, setCreator1] = useState<Creator | null>(null);
  const [creator2, setCreator2] = useState<Creator | null>(null);
  const [isSelecting, setIsSelecting] = useState<1 | 2 | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (creator: Creator) => {
    if (isSelecting === 1) setCreator1(creator);
    else if (isSelecting === 2) setCreator2(creator);
    setIsSelecting(null);
    setSearchTerm("");
  };

  const filteredCreators = CREATORS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Selection Area */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Slot 1 */}
          <div className="flex flex-col gap-2">
              {creator1 ? (
                  <div className="relative">
                      <CreatorCard {...creator1} />
                      <button
                          onClick={() => setCreator1(null)}
                          className="absolute -top-2 -right-2 bg-card rounded-full p-1 shadow-md border border-border/50"
                      >
                          <X className="w-4 h-4 text-red-500" />
                      </button>
                  </div>
              ) : (
                  <button
                      onClick={() => setIsSelecting(1)}
                      className="h-[200px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                      <Plus className="w-8 h-8" />
                      <span className="text-xs font-medium">Select Scholar</span>
                  </button>
              )}
          </div>

          {/* Slot 2 */}
          <div className="flex flex-col gap-2">
              {creator2 ? (
                  <div className="relative">
                      <CreatorCard {...creator2} />
                      <button
                           onClick={() => setCreator2(null)}
                          className="absolute -top-2 -right-2 bg-card rounded-full p-1 shadow-md border border-border/50"
                      >
                           <X className="w-4 h-4 text-red-500" />
                      </button>
                  </div>
              ) : (
                  <button
                      onClick={() => setIsSelecting(2)}
                      className="h-[200px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                      <Plus className="w-8 h-8" />
                      <span className="text-xs font-medium">Select Scholar</span>
                  </button>
              )}
          </div>
      </div>

      {/* Comparison Table */}
      {creator1 && creator2 && (
          <Card className="overflow-hidden border-border/50 bg-card shadow-sm">
              <div className="grid grid-cols-3 bg-muted border-b border-border/50 p-3 text-xs font-bold text-muted-foreground text-center">
                  <div>Attriubte</div>
                  <div className="text-primary">{creator1.name.split(" ")[0]}</div>
                  <div className="text-primary">{creator2.name.split(" ")[0]}</div>
              </div>

              <div className="divide-y divide-border/50">
                  <Row label="Region" icon={Globe} val1={creator1.country} val2={creator2.country} />
                  <Row label="Category" icon={BookOpen} val1={creator1.category} val2={creator2.category} isCap />
                  <Row label="Languages" icon={Users} val1={creator1.languages.length} val2={creator2.languages.length} />
                  <Row label="Status" icon={BarChart3} val1={creator1.tier} val2={creator2.tier} isCap />
              </div>
          </Card>
      )}

      {/* Note if mostly complete */}
      {(!creator1 || !creator2) && !isSelecting && (
          <div className="text-center text-muted-foreground py-10">
              <p className="text-sm">Select two creators to compare their profiles side-by-side.</p>
          </div>
      )}

      {/* Selection Modal */}
      {isSelecting && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center">
              <div className="bg-card rounded-t-2xl sm:rounded-2xl p-4 h-[80vh] flex flex-col animate-in slide-in-from-bottom">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">Select Scientist {isSelecting}</h3>
                      <button onClick={() => setIsSelecting(null)}><X className="w-6 h-6" /></button>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full mb-4"
                    autoFocus
                  />
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-8">
                       {filteredCreators.map(c => (
                           <div key={c.id} onClick={() => handleSelect(c)} className="cursor-pointer hover:opacity-80">
                               <CreatorCard {...c} />
                           </div>
                       ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function Row({ label, icon: Icon, val1, val2, isCap }: any) {
    return (
        <div className="grid grid-cols-3 p-3 text-xs items-center text-center">
             <div className="flex flex-col items-center gap-1 text-muted-foreground">
                 <Icon className="w-4 h-4" />
                 <span className="text-[10px]">{label}</span>
             </div>
             <div className={`font-medium text-foreground ${isCap ? 'capitalize' : ''}`}>{val1}</div>
             <div className={`font-medium text-foreground ${isCap ? 'capitalize' : ''}`}>{val2}</div>
        </div>
    )
}
