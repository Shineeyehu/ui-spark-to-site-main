import React from 'react';
import BirthdayForm from '@/components/BirthdayForm';
import { useIsMobile } from '@/hooks/use-mobile';

const BirthdayPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${isMobile ? 'flex flex-col' : 'flex'}`}>
      {/* Image Section */}
      <div className={`${isMobile ? 'w-full h-48' : 'w-1/2'} relative`}>
        <img
          src="/lovable-uploads/4e6a13e7-7a7c-450f-8a36-8db3c16983f2.png"
          alt="Traditional Chinese Fortune Telling Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Form Section */}
      <div className={`${isMobile ? 'w-full flex-1' : 'w-1/2'} relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200`}>
        <BirthdayForm />
      </div>
    </div>
  );
};

export default BirthdayPage;