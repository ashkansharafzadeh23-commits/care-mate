import { AICoordinatorMessage } from '../types';

/**
 * AI Coordinator Service
 * Implements the UNDERSTAND -> MATCH -> COORDINATE workflow.
 * 
 * Rules enforced:
 * - Rule 11: Never expose AI keys or sensitive secrets in frontend code.
 * - Rule 12: AI requests must eventually route through a secure backend API.
 * - Rule 13: Do not use an LLM as the source of truth for bookings, verification, availability, etc.
 * - Rule 15: CareMate must not present AI-generated medical diagnosis as confirmed medical advice.
 */

export interface AIResponseResult {
  replyText: string;
  isAction?: boolean;
  actionType?: 'see_matches' | 'view_schedule' | 'emergency_help';
  extractedNeeds?: string[];
  isEmergencyAlert?: boolean;
}

class AICoordinatorService {
  /**
   * Evaluates input for acute medical emergency indicators.
   * If detected, returns immediate emergency escalation advice and medical disclaimer.
   */
  public checkEmergencyTriage(text: string): { isEmergency: boolean; response: string } | null {
    const lower = text.toLowerCase();
    const emergencyKeywords = [
      'emergency', 
      'chest pain', 
      'heart attack', 
      'fall', 
      'unconscious', 
      'stroke', 
      'cannot breathe', 
      'choking', 
      'bleeding'
    ];

    const hasEmergency = emergencyKeywords.some(keyword => lower.includes(keyword));
    if (hasEmergency) {
      return {
        isEmergency: true,
        response: "It sounds like this might be a medical emergency. CareMate does not provide medical diagnoses or emergency triage. Please call 911 or local emergency services immediately."
      };
    }

    return null;
  }

  /**
   * Process a message through the AI Coordinator workflow:
   * UNDERSTAND (extract needs/preferences) -> MATCH (prepare matches) -> COORDINATE.
   */
  public async processUserMessage(
    userText: string, 
    conversationHistory: AICoordinatorMessage[]
  ): Promise<AIResponseResult> {
    // 1. Safety & Emergency Filter First
    const emergencyCheck = this.checkEmergencyTriage(userText);
    if (emergencyCheck) {
      return {
        replyText: emergencyCheck.response,
        isAction: true,
        actionType: 'emergency_help',
        isEmergencyAlert: true
      };
    }

    // 2. Structured flow simulation (ready to connect to server-side `/api/chat` or `/api/coordinator`)
    const lower = userText.toLowerCase();
    const messageCount = conversationHistory.filter(m => m.sender === 'user').length;

    // Simulate UNDERSTAND phase
    if (messageCount <= 1) {
      return {
        replyText: "I can certainly help you coordinate care. What days of the week and roughly what hours do you need someone?",
        extractedNeeds: this.extractCareNeeds(userText)
      };
    } else if (messageCount === 2) {
      return {
        replyText: "Understood. Tuesdays and Thursdays from 9am to 3pm. Does your loved one have any specific care requirements, such as mobility assistance, medication management, or memory care?",
        extractedNeeds: ['Mobility assistance', 'Scheduling']
      };
    } else {
      // Transition to MATCH phase
      return {
        replyText: "I've analyzed your schedule and care requirements. I found verified caregivers who specialize in mobility and match your exact hours. Would you like to review them now?",
        isAction: true,
        actionType: 'see_matches',
        extractedNeeds: ['Mobility Support', 'Medication Mgmt']
      };
    }
  }

  private extractCareNeeds(text: string): string[] {
    const detected: string[] = [];
    const lower = text.toLowerCase();
    if (lower.includes('mobility') || lower.includes('walk') || lower.includes('wheelchair')) detected.push('Mobility assistance');
    if (lower.includes('medication') || lower.includes('pill') || lower.includes('medicine')) detected.push('Medication management');
    if (lower.includes('dementia') || lower.includes('memory') || lower.includes('alzheimer')) detected.push('Memory care');
    if (lower.includes('physical therapy') || lower.includes('exercise')) detected.push('Physical therapy');
    return detected;
  }
}

export const aiCoordinatorService = new AICoordinatorService();
