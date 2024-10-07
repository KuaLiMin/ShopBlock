import React from 'react'
import './CSS/FAQ.css'

export const FAQ = () => {
  const faqs = [
    {
      question: 'How does the rental process work?',
      answer: 'To rent an item, simply browse through our categories, select the item, choose your rental duration (hourly, daily, or weekly), and proceed with payment. The owner of the item will contact you to arrange delivery or pickup.'
    },
    {
      question: 'What are the available rental durations?',
      answer: 'We offer flexible rental durations: hourly, daily, or weekly. You can choose the rental period that best suits your needs when booking an item.'
    },
    {
      question: 'What types of items can I rent?',
      answer: 'Our platform offers a wide variety of items for rent, including Electronics (e.g., power drills), Services (e.g., plumbing), Supplies (e.g., ladders), and even Clothing.'
    },
    {
      question: 'Can I extend my rental period?',
      answer: 'Yes, you can request an extension for your rental depending on the availability of the item. Please contact the owner to confirm availability for an extended rental period.'
    },
    {
      question: 'How do I return a rented item?',
      answer: 'Once your rental period ends, return the item based on the terms agreed upon with the owner. This could involve dropping the item off or scheduling a pickup.'
    },
    {
      question: 'What happens if I damage an item?',
      answer: 'If you damage an item, please notify the owner immediately. Depending on the terms, you may be liable for repair costs or a replacement.'
    },
    {
      question: 'How do I cancel a rental?',
      answer: 'You can cancel a rental via your rental dashboard. Please be aware that some cancellations may incur a fee depending on the owner’s policies.'
    },
    {
      question: 'Are there any delivery options for rentals?',
      answer: 'Delivery options vary by owner. Some may offer delivery for an additional fee, while others require renters to pick up the item.'
    }
  ];

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQ