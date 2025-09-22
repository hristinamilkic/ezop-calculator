import ContractCalculator from '@/components/ContractCalculator';
import DemoContent from '@/components/DemoContent';

const Index = () => {
  return (
    <main>
      <ContractCalculator />
      <div className="py-8 border-t">
        <DemoContent />
      </div>
    </main>
  );
};

export default Index;
