
import { supabase } from '@/integrations/supabase/client';

interface ValueOption {
  id: string;
  text: string;
  valueHint: string;
}

export const saveValueSelection = async (scenarioId: string, optionId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users_values')
      .upsert(
        {
          user_id: user.user.id,
          scenario_id: scenarioId,
          option_id: optionId,
        },
        { onConflict: 'user_id, scenario_id' }
      );

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error saving value selection:', error);
    throw error;
  }
};

export const getValueSelections = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users_values')
      .select('*')
      .eq('user_id', user.user.id);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting value selections:', error);
    throw error;
  }
};

export const determineValuePattern = (selections: any[]): string => {
  // This is a simplified approach - in production, you'd have more sophisticated logic
  const patterns = {
    'empathetic': ['1b', '2c', '3c'],
    'ambitious': ['1a', '2a', '3a'],
    'balanced': ['1c', '2b', '3b']
  };
  
  // Count which pattern has the most matches
  const counts = Object.entries(patterns).map(([pattern, values]) => {
    const matchCount = selections.filter(s => values.includes(s.option_id)).length;
    return { pattern, matchCount };
  });
  
  // Sort by match count (highest first)
  counts.sort((a, b) => b.matchCount - a.matchCount);
  
  // Return the pattern with most matches
  if (counts.length > 0 && counts[0].matchCount > 0) {
    const patternName = counts[0].pattern;
    return patternName.charAt(0).toUpperCase() + patternName.slice(1);
  }
  
  return 'Undefined';
};

export const updateUserValuePattern = async (valuePattern: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ value_pattern: valuePattern })
      .eq('id', user.user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user value pattern:', error);
    throw error;
  }
};
