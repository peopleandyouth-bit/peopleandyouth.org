import React from 'react';
import UniversalCrossMappingComponent from '@/components/CrossMappingEngine';

export default async function DynamicCatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slugPath = resolvedParams.slug ? '/' + resolvedParams.slug.join('/') : '/node';
  const nodeTitle = resolvedParams.slug ? resolvedParams.slug[resolvedParams.slug.length - 1].replace(/-/g, ' ').toUpperCase() : 'INSTITUTIONAL NODE';

  return (
    <UniversalCrossMappingComponent
      slugPath={slugPath}
      title={nodeTitle}
      subtitle="Sovereign Institutional Node & Cross-Mapped Knowledge Ecosystem"
      division="Digital Headquarters"
    />
  );
}