
import { supabase } from '@/integrations/supabase/client';

// Interfaces for personality assessment data
export interface QuestionCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface PersonalityQuestion {
  id: string;
  category_id: string;
  question_text: string;
  insight_description: string;
  sort_order: number;
  category?: QuestionCategory;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  trait_value: string;
  sort_order: number;
}

export interface UserResponse {
  question_id: string;
  option_id: string;
  importance: number;
}

// Fetch question categories
export const getQuestionCategories = async (): Promise<QuestionCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('question_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching question categories:', error);
    throw error;
  }
};

// Fetch questions by category
export const getQuestionsByCategory = async (categoryId: string): Promise<PersonalityQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('personality_questions')
      .select(`
        *,
        question_options(*)
      `)
      .eq('category_id', categoryId)
      .order('sort_order');

    if (error) throw error;
    
    // Transform data to include options
    return data?.map(item => ({
      ...item,
      options: item.question_options
    })) || [];
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    throw error;
  }
};

// Get all questions with options
export const getAllQuestions = async (): Promise<PersonalityQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('personality_questions')
      .select(`
        *,
        question_options(*)
      `)
      .order('sort_order');

    if (error) throw error;
    
    // Transform data to include options
    return data?.map(item => ({
      ...item,
      options: item.question_options
    })) || [];
  } catch (error) {
    console.error('Error fetching all questions:', error);
    throw error;
  }
};

// Save user response to a question
export const saveUserResponse = async (
  questionId: string, 
  optionId: string, 
  importance: number = 5
): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_responses')
      .upsert({
        user_id: user.user.id,
        question_id: questionId,
        option_id: optionId,
        importance
      }, {
        onConflict: 'user_id, question_id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving user response:', error);
    throw error;
  }
};

// Get user's previously saved responses
export const getUserResponses = async (): Promise<UserResponse[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_responses')
      .select('question_id, option_id, importance')
      .eq('user_id', user.user.id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user responses:', error);
    throw error;
  }
};

// Calculate personality traits based on responses
export const calculatePersonalityTraits = async (): Promise<Record<string, number>> => {
  try {
    const responses = await getUserResponses();
    if (responses.length === 0) return {};

    // Get all options for the responses
    const optionIds = responses.map(r => r.option_id);
    const { data: options, error } = await supabase
      .from('question_options')
      .select('id, trait_value')
      .in('id', optionIds);

    if (error) throw error;

    // Map option ids to trait values
    const optionTraits = options?.reduce((acc, opt) => {
      acc[opt.id] = opt.trait_value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Calculate trait scores
    const traits: Record<string, { score: number, count: number }> = {};
    
    responses.forEach(response => {
      const traitValue = optionTraits[response.option_id];
      if (traitValue) {
        if (!traits[traitValue]) {
          traits[traitValue] = { score: 0, count: 0 };
        }
        traits[traitValue].score += response.importance;
        traits[traitValue].count += 1;
      }
    });

    // Normalize scores to percentages
    const normalizedTraits: Record<string, number> = {};
    for (const [trait, data] of Object.entries(traits)) {
      normalizedTraits[trait] = Math.round((data.score / (data.count * 10)) * 100);
    }

    return normalizedTraits;
  } catch (error) {
    console.error('Error calculating personality traits:', error);
    throw error;
  }
};

// Update user's personality traits in profile
export const updateUserPersonalityTraits = async (traits: Record<string, number>): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ personality_traits: traits })
      .eq('id', user.user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating personality traits:', error);
    throw error;
  }
};

// Calculate compatibility between two users based on personality traits
export const calculateCompatibility = (
  userTraits: Record<string, number>,
  otherUserTraits: Record<string, number>
): number => {
  if (!userTraits || !otherUserTraits || 
      Object.keys(userTraits).length === 0 || 
      Object.keys(otherUserTraits).length === 0) {
    return 0.5; // Default to 50% if no data
  }

  // Get all unique traits
  const allTraits = [...new Set([
    ...Object.keys(userTraits),
    ...Object.keys(otherUserTraits)
  ])];

  if (allTraits.length === 0) return 0.5;

  let compatibilityScore = 0;
  let maxPossibleScore = 0;

  allTraits.forEach(trait => {
    const userValue = userTraits[trait] || 0;
    const otherValue = otherUserTraits[trait] || 0;
    
    // Weight by the average importance of this trait to both users
    const traitImportance = (userValue + otherValue) / 2;
    
    // Calculate similarity (100 - difference)
    const similarity = 100 - Math.abs(userValue - otherValue);
    
    // Add weighted similarity to score
    compatibilityScore += (similarity * traitImportance);
    maxPossibleScore += (100 * traitImportance);
  });

  // Normalize to 0-1 range
  return maxPossibleScore > 0 ? compatibilityScore / maxPossibleScore : 0.5;
};
