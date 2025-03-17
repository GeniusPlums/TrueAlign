import { supabase } from '@/integrations/supabase/client';

// This is a helper script to seed the database with personality questions
// It can be used in the browser console for development purposes

export const seedPersonalityQuestions = async () => {
  try {
    // Get category IDs
    const { data: categories, error: catError } = await supabase
      .from('question_categories')
      .select('id, name');
      
    if (catError) throw catError;
    
    if (!categories || categories.length === 0) {
      console.error('No categories found. Please run the SQL migration first.');
      return;
    }
    
    // Create a map of category names to IDs
    const categoryMap: Record<string, string> = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Define questions with their options
    const trustQuestions = [
      {
        question_text: "Your partner wants to take a big financial risk for a dream project, but you prefer security. How do you handle it?",
        insight_description: "Shows if you prioritize stability, support for others' ambitions, or finding a balance.",
        sort_order: 1,
        category_id: categoryMap['Trust and Integrity'],
        options: [
          {
            option_text: "Support their dream fully, even if it makes you nervous",
            trait_value: "supportive",
            sort_order: 1
          },
          {
            option_text: "Suggest a smaller trial or phased approach to minimize risk",
            trait_value: "pragmatic",
            sort_order: 2
          },
          {
            option_text: "Express your concerns and suggest safer alternatives",
            trait_value: "cautious",
            sort_order: 3
          }
        ]
      },
      {
        question_text: "You find out a close friend has been dishonest with you. Do you confront them immediately, give them a chance to explain, or distance yourself quietly?",
        insight_description: "Reveals your approach to trust, honesty, and conflict.",
        sort_order: 2,
        category_id: categoryMap['Trust and Integrity'],
        options: [
          {
            option_text: "Confront them immediately to clear the air",
            trait_value: "direct",
            sort_order: 1
          },
          {
            option_text: "Approach them calmly and give them a chance to explain",
            trait_value: "understanding",
            sort_order: 2
          },
          {
            option_text: "Distance yourself and reassess the friendship",
            trait_value: "self-protective",
            sort_order: 3
          }
        ]
      }
    ];
    
    const empathyQuestions = [
      {
        question_text: "A friend is going through a tough time but hasn't reached out. Do you wait for them to ask for help, check in casually, or offer support directly?",
        insight_description: "Shows your level of empathy and how proactive you are emotionally.",
        sort_order: 1,
        category_id: categoryMap['Empathy and Support'],
        options: [
          {
            option_text: "Wait for them to reach out when they're ready",
            trait_value: "respectful",
            sort_order: 1
          },
          {
            option_text: "Check in casually to let them know you're there",
            trait_value: "attentive",
            sort_order: 2
          },
          {
            option_text: "Reach out directly with specific offers of help",
            trait_value: "proactive",
            sort_order: 3
          }
        ]
      },
      {
        question_text: "Your partner is stressed about work but hasn't talked about it. How do you respond?",
        insight_description: "Do you respect their space, encourage them to share, or jump in to help? This reflects emotional availability.",
        sort_order: 2,
        category_id: categoryMap['Empathy and Support'],
        options: [
          {
            option_text: "Give them space until they're ready to talk",
            trait_value: "respectful",
            sort_order: 1
          },
          {
            option_text: "Gently encourage them to share what's bothering them",
            trait_value: "supportive",
            sort_order: 2
          },
          {
            option_text: "Take over some of their responsibilities to lighten their load",
            trait_value: "solution-oriented",
            sort_order: 3
          }
        ]
      }
    ];
    
    // Add all questions to one array
    const allQuestions = [
      ...trustQuestions,
      ...empathyQuestions,
      // Add more categories of questions here
    ];
    
    // Insert questions and get their IDs
    for (const question of allQuestions) {
      const { data: questionData, error: questionError } = await supabase
        .from('personality_questions')
        .insert({
          question_text: question.question_text,
          insight_description: question.insight_description,
          sort_order: question.sort_order,
          category_id: question.category_id
        })
        .select();
        
      if (questionError) {
        console.error('Error inserting question:', questionError);
        continue;
      }
      
      if (!questionData || questionData.length === 0) {
        console.error('No question data returned');
        continue;
      }
      
      const questionId = questionData[0].id;
      
      // Insert options for this question
      for (const option of question.options) {
        const { error: optionError } = await supabase
          .from('question_options')
          .insert({
            question_id: questionId,
            option_text: option.option_text,
            trait_value: option.trait_value,
            sort_order: option.sort_order
          });
          
        if (optionError) {
          console.error('Error inserting option:', optionError);
        }
      }
    }
    
    console.log('Seeding complete!');
    
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
};

declare global {
  interface Window {
    seedPersonalityQuestions: typeof seedPersonalityQuestions;
  }
}

window.seedPersonalityQuestions = seedPersonalityQuestions;
