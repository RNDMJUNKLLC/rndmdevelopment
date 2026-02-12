import React from 'react';
import SEOHead from '@components/SEOHead';
import ContactForm from '@components/forms/ContactForm';

export const Contact: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Contact Us | RNDM Development"
        description="Get in touch with RNDM Development. Send us your inquiry and let's discuss your project."
        path="/contact"
        keywords="contact, inquiry, web development, get in touch"
      />
      <ContactForm />
    </>
  );
};

export default Contact;
