export interface PersonalityType {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export const analystTypes: PersonalityType[] = [
  {
    id: 'architect',
    image: '/src/assets/Architect.webp',
    title: 'The Architect',
    subtitle: 'INTJ-A / INTJ-T',
    description: 'Imaginative and strategic thinkers, with a plan for everything. They are independent, decisive, and have strong willpower to achieve their vision.'
  },
  {
    id: 'logician',
    image: '/src/assets/Logician.webp',
    title: 'The Logician',
    subtitle: 'INTP-A / INTP-T',
    description: 'Innovative inventors with an unquenchable thirst for knowledge. They are flexible, tolerant, and focused on possibilities and understanding.'
  },
  {
    id: 'commander',
    image: '/src/assets/Commander.webp',
    title: 'The Commander',
    subtitle: 'ENTJ-A / ENTJ-T',
    description: 'Bold, imaginative and strong-willed leaders, always finding a way or making one. They are natural-born leaders with charisma and confidence.'
  },
  {
    id: 'debater',
    image: '/src/assets/Debater.webp',
    title: 'The Debater',
    subtitle: 'ENTP-A / ENTP-T',
    description: 'Smart and curious thinkers who cannot resist an intellectual challenge. They are quick-witted, versatile, and love to brainstorm new possibilities.'
  }
]
export const diplomatTypes: PersonalityType[] = [
  {
    id: 'advocate',
    image: '/src/assets/Advocate.webp',
    title: 'The Advocate',
    subtitle: 'INFJ-A / INFJ-T',
    description: 'Quiet and mystical, yet very inspiring and tireless idealists. They are compassionate, creative, and driven by their values.'
  },
  {
    id: 'mediator',
    image: '/src/assets/Mediator.webp',
    title: 'The Mediator',
    subtitle: 'INFP-A / INFP-T',
    description: 'Poetic, kind and altruistic people, always eager to help a good cause. They are idealistic, loyal to their values, and seek harmony.'
  },
  {
    id: 'protagonist',
    image: '/src/assets/Protagonist.webp',
    title: 'The Protagonist',
    subtitle: 'ENFJ-A / ENFJ-T',
    description: 'Charismatic and inspiring leaders who can mesmerize their listeners. They are empathetic, organized, and driven to help others realize their potential.'
  },
  {
    id: 'campaigner',
    image: '/src/assets/Campaigner.webp',
    title: 'The Campaigner',
    subtitle: 'ENFP-A / ENFP-T',
    description: 'Enthusiastic, creative and sociable free spirits who can always find a reason to smile. They are curious, energetic, and love exploring new ideas.'
  }
];
export const sentinelTypes: PersonalityType[] = [
  {
    id: 'logistician',
    image: '/src/assets/Logistician.webp',
    title: 'The Logistician',
    subtitle: 'ISTJ-A / ISTJ-T',
    description: 'Practical and fact-minded individuals, whose reliability cannot be doubted. They are responsible, organized, and value tradition.'
  },
  {
    id: 'defender',
    image: '/src/assets/Defender.webp',
    title: 'The Defender',
    subtitle: 'ISFJ-A / ISFJ-T',
    description: 'Very dedicated and warm protectors, always ready to defend their loved ones. They are meticulous, caring, and value harmony.'
  },
  {
    id: 'executive',
    image: '/src/assets/Executive.webp',
    title: 'The Executive',
    subtitle: 'ESTJ-A / ESTJ-T',
    description: 'Excellent administrators, unsurpassed at managing things – or people. They are efficient, logical, and value order and structure.'
  },
  {
    id: 'consul',
    image: '/src/assets/Consul.webp',
    title: 'The Consul',
    subtitle: 'ESFJ-A / ESFJ-T',
    description: 'Extraordinarily caring, social and popular people, always eager to help. They are warm-hearted, cooperative, and value community.'
  }

];
export const explorerTypes: PersonalityType[] = [
  {
    id: 'virtuoso',
    image: '/src/assets/Virtuoso.webp',
    title: 'The Virtuoso',
    subtitle: 'ISTP-A / ISTP-T',
    description: 'Bold and practical experimenters, masters of all kinds of tools. They are adventurous, resourceful, and love hands-on challenges.'
  },
  {
    id: 'adventurer',
    image: '/src/assets/Adventurer.webp',
    title: 'The Adventurer',
    subtitle: 'ISFP-A / ISFP-T',
    description: 'Flexible and charming artists, always ready to explore and experience something new. They are sensitive, creative, and value aesthetics.'
  },
  {
    id: 'entrepreneur',
    image: '/src/assets/Entrepreneur.webp',
    title: 'The Entrepreneur',
    subtitle: 'ESTP-A / ESTP-T',
    description: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge. They are spontaneous, action-oriented, and love excitement.'
  },
  {
    id: 'entertainer',
    image: '/src/assets/Entertainer.webp',
    title: 'The Entertainer',
    subtitle: 'ESFP-A / ESFP-T',
    description: 'Spontaneous, energetic and enthusiastic people – life is never boring around them. They are playful, sociable, and love to entertain others.'
  }
];
