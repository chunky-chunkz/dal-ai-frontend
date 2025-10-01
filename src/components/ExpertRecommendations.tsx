import React from 'react';
import { ExpertRecommendation, formatConfidence } from '../api/experts';

export interface ExpertRecommendationsProps {
  experts: ExpertRecommendation[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

interface ExpertCardProps {
  expert: ExpertRecommendation;
  rank: number;
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, rank }) => {
  // Generate mailto link
  const generateMailtoLink = (email?: string, name?: string, role?: string) => {
    if (!email) return undefined;
    
    const subject = encodeURIComponent(`Expert Consultation Request - ${name}`);
    const body = encodeURIComponent(
      `Hi ${name},\n\n` +
      `I found your profile through our expert recommendation system and would like to discuss a potential collaboration.\n\n` +
      `Your expertise in ${role} seems like a great fit for our project.\n\n` +
      `Could we schedule a brief call to discuss?\n\n` +
      `Best regards`
    );
    
    return `mailto:${email}?subject=${subject}&body=${body}`;
  };

  // Generate MS Teams deep link
  const generateTeamsLink = (email?: string) => {
    if (!email) return undefined;
    
    // MS Teams deep link format for starting a chat
    return `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(email)}`;
  };

  const mailtoLink = generateMailtoLink(expert.email, expert.name, expert.role);
  const teamsLink = generateTeamsLink(expert.email);

  // Extract languages and products from the expert data
  // Note: These would typically come from the full expert profile
  // For now, we'll extract them from the reason array if available
  const extractSkillsFromReasons = (reasons: string[]): string[] => {
    const skillsReason = reasons.find(reason => reason.toLowerCase().includes('skills:'));
    if (skillsReason) {
      const skillsText = skillsReason.split('Skills:')[1];
      if (skillsText) {
        return skillsText.split(',').map(skill => skill.trim());
      }
    }
    return [];
  };

  const skillsFromReasons = extractSkillsFromReasons(expert.reason);

  return (
    <div className="expert-card bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header with rank and confidence */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
            {rank}
          </span>
          <div className="confidence-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {formatConfidence(expert.confidence)} match
          </div>
        </div>
      </div>

      {/* Expert Info */}
      <div className="expert-info mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {expert.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {expert.role}
        </p>
        {expert.email && (
          <p className="text-sm text-gray-500">
            📧 {expert.email}
          </p>
        )}
      </div>

      {/* Skills/Languages (extracted from reasons) */}
      {skillsFromReasons.length > 0 && (
        <div className="skills-section mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {skillsFromReasons.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                {skill}
              </span>
            ))}
            {skillsFromReasons.length > 6 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-500">
                +{skillsFromReasons.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Match Reasons */}
      <div className="reasons-section mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Why this expert matches</h4>
        <div className="space-y-1">
          {expert.reason.slice(0, 3).map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-gray-600"
            >
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{reason}</span>
            </div>
          ))}
          {expert.reason.length > 3 && (
            <div className="text-xs text-gray-500 ml-4">
              +{expert.reason.length - 3} more reasons
            </div>
          )}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="cta-buttons flex gap-3">
        {mailtoLink && (
          <a
            href={mailtoLink}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        )}
        
        {teamsLink && (
          <a
            href={teamsLink}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.25 5.25c.828 0 1.5.672 1.5 1.5v10.5c0 .828-.672 1.5-1.5 1.5H3.75c-.828 0-1.5-.672-1.5-1.5V6.75c0-.828.672-1.5 1.5-1.5h16.5zm-7.5 3h-9v7.5h9v-7.5zm1.5 0v7.5h6v-7.5h-6z"/>
            </svg>
            Teams
          </a>
        )}
        
        {/* Fallback button if no contact info */}
        {!expert.email && (
          <button
            disabled
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Contact Info N/A
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingCard: React.FC = () => (
  <div className="loading-card bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div className="animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-36 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-44 h-4 bg-gray-200 rounded"></div>
      </div>
      
      <div className="mb-4">
        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
          <div className="w-18 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-4/5 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const ExpertRecommendations: React.FC<ExpertRecommendationsProps> = ({
  experts,
  loading = false,
  error = null,
  onRetry,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`expert-recommendations ${className}`}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`expert-recommendations ${className}`}>
        <div className="error-state bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Failed to load expert recommendations
          </div>
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (experts.length === 0) {
    return (
      <div className={`expert-recommendations ${className}`}>
        <div className="empty-state bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-gray-600 text-lg font-medium mb-2">
            No experts found
          </div>
          <div className="text-gray-500 text-sm">
            Try adjusting your search criteria or filters
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`expert-recommendations ${className}`}>
      <div className="results-header mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Expert Recommendations
          </h2>
          <div className="text-sm text-gray-500">
            {experts.length} expert{experts.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experts.map((expert, index) => (
          <ExpertCard
            key={expert.id}
            expert={expert}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpertRecommendations;
