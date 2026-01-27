import { Check, Plus, Lock } from "lucide-react";
import Button from "./Button";

interface CreatorCardProps {
  id: string;
  name: string;
  category: string;
  avatar: string;
  verified?: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  showUnlock?: boolean; // For when free limit is reached
}

export default function CreatorCard({
  name,
  category,
  avatar,
  verified = false,
  isFollowing = false,
  onFollow,
  showUnlock = false,
}: CreatorCardProps) {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-40 flex-shrink-0 snap-center hover:border-teal/30 transition-all">
      <div className="relative mb-3 bg-teal-light/50 p-1 rounded-full">
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full object-cover bg-gray-200"
        />
        {verified && (
          <div className="absolute bottom-0 right-0 bg-teal text-white p-1 rounded-full border-2 border-white">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      <h3 className="font-bold text-gray-dark text-sm text-center line-clamp-1 w-full mb-1">
        {name}
      </h3>
      <p className="text-xs text-gray-500 mb-3 text-center">{category}</p>

      {showUnlock ? (
        <Button variant="secondary" size="sm" className="w-full text-xs rounded-full">
          <Lock className="w-3 h-3 mr-1" /> Unlock
        </Button>
      ) : (
        <Button
          variant={isFollowing ? "primary" : "outline"}
          size="sm"
          className={`w-full text-xs rounded-full ${
            isFollowing ? "bg-teal text-white" : "border-teal text-teal hover:bg-teal-light"
          }`}
          onClick={onFollow}
        >
          {isFollowing ? (
            <span className="flex items-center">
              Following <Check className="w-3 h-3 ml-1" />
            </span>
          ) : (
            <span className="flex items-center">
              Follow <Plus className="w-3 h-3 ml-1" />
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
