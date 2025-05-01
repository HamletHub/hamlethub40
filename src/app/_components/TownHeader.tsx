import Image from 'next/image';

interface TownHeaderProps {
  hubTitle: string;
}

const TownHeader = ({ hubTitle }: TownHeaderProps) => {
  return (
    <header className="mb-6">
      <div className="flex flex-col">
        {/* Logo in the upper left */}
        <div className="mb-2 md:pt-8">
          <Image 
            src="/images/HH_logo.svg" 
            alt="HamletHub Logo" 
            width={223} 
            height={32} 
            priority
          />
        </div>
        
        {/* Hub title in gold */}
        <h2 
          className="text-[18px] font-vollkorn font-normal mb-3"
          style={{ color: 'rgb(170, 150, 95)' }}
        >
          {hubTitle}
        </h2>
        
        {/* Horizontal light grey line */}
        <div 
          className="w-full h-[1px]" 
          style={{ backgroundColor: 'rgb(229, 229, 229)' }}
        ></div>
      </div>
    </header>
  );
};

export default TownHeader; 