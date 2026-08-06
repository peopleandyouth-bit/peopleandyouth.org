import React from 'react';
import UniversalCrossMappingComponent from '@/components/CrossMappingEngine';

export default function ObservatoriesPage() {
  return (
    <UniversalCrossMappingComponent
      slugPath="/observatories"
      title="Institutional Observatories"
      subtitle="10 Real-Time Monitors across Youth, Economy, Trade, Labour, Climate, and Agriculture"
      division="Observatory Division"
    />
  );
}