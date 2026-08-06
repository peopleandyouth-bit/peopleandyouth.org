import React from 'react';
import UniversalCrossMappingComponent from '@/components/CrossMappingEngine';

export default function AcademyPage() {
  return (
    <UniversalCrossMappingComponent
      slugPath="/academy"
      title="People & Youth Academy"
      subtitle="Leadership School, Policy School, Research School, AI School & Executive Education"
      division="Academic & Leadership Division"
    />
  );
}