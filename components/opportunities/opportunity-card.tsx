import Link from 'next/link';
import { Opportunity } from '@/types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const categoryLabels: Record<string, string> = {
    career: 'Career',
    fellowship: 'Fellowship',
    scholarship: 'Scholarship',
    grant: 'Grant',
    residency: 'Residency',
  };

  const typeLabels: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    fellowship_term: 'Term Fellowship',
    grant_award: 'Grant Award',
  };

  return (
    <div className="border border-neutral-200 p-6 rounded-none bg-white hover:border-neutral-900 transition-colors duration-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-xs tracking-wider uppercase text-neutral-500 mb-3">
          <span className="font-semibold text-neutral-900">{categoryLabels[opportunity.category] || opportunity.category}</span>
          <span>{typeLabels[opportunity.type] || opportunity.type}</span>
        </div>
        <h3 className="text-xl font-serif text-neutral-900 mb-2 font-normal line-clamp-2">
          <Link href={`/opportunities/${opportunity.slug}`} className="hover:underline">
            {opportunity.title}
          </Link>
        </h3>
        <p className="text-xs text-neutral-600 mb-4">{opportunity.department} • {opportunity.location}</p>
        <p className="text-sm text-neutral-700 font-sans line-clamp-3 leading-relaxed mb-6">
          {opportunity.summary}
        </p>
      </div>
      <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span>{opportunity.deadline ? `Deadline: ${new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Rolling Basis'}</span>
        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="text-neutral-900 font-semibold hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
        >
          View Position &rarr;
        </Link>
      </div>
    </div>
  );
}
