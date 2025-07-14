import React from 'react';
import PersonalityCard from '../components/PersonalityCard';
import { analystTypes } from '../data/personalityTypes';
import { diplomatTypes } from '../data/personalityTypes';
import { sentinelTypes } from '../data/personalityTypes';
import { explorerTypes } from '../data/personalityTypes';
import { Brain, Sparkles } from 'lucide-react';
import '../styles/PersonalityPage.css';

const PersonalityPage: React.FC = () => {
  return (
    <div className="personality-page">
      <div className="personality-background-pattern"></div>
      
      <header className="personality-header">
        <div className="personality-header-content">
          <div className="personality-logo">
            <Brain className="personality-logo-icon" />
            <Sparkles className="personality-sparkle-icon" />
          </div>
          <h1 className="personality-main-title">Personality Types</h1>
        </div>
      </header>

      <main className="personality-main-content">
        {/* Analysts Section */}
        <section className="personality-section">
          <div className="personality-section-header">
            <h2 className="personality-section-title">Analysts</h2>
            <p className="personality-section-description">
              These personality types embrace rationality, impartiality, and intellectual excellence. 
              They are natural problem-solvers who love theoretical and abstract concepts.
            </p>
          </div>
          <div className="personality-cards-container">
            {analystTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 200}
              />
            ))}
          </div>
        </section>

        {/* Diplomats Section */}
        <section className="personality-section">
          <div className="personality-section-header">
            <h2 className="personality-section-title">Diplomats</h2>
            <p className="personality-section-description">
              Diplomats are known for their empathy, diplomacy, and strong values. They are idealistic and driven by a desire to help others.
            </p>
          </div>
          <div className="personality-cards-container">
            {diplomatTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 200 + 400}
              />
            ))}
          </div>
        </section>

        {/* Sentinels Section */}
        <section className="personality-section">
          <div className="personality-section-header">
            <h2 className="personality-section-title">Sentinels</h2>
            <p className="personality-section-description">
              Sentinels are practical, detail-oriented, and responsible. They value tradition and order, making them reliable and hardworking.
            </p>
          </div>
          <div className="personality-cards-container">
            {sentinelTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 200 + 800}
              />
            ))}
          </div>
        </section>

        {/* Explorers Section */}
        <section className="personality-section">
          <div className="personality-section-header">
            <h2 className="personality-section-title">Explorers</h2>
            <p className="personality-section-description">
              Explorers are spontaneous, energetic, and love to experience the world. They are adaptable and thrive in dynamic environments.
            </p>
          </div>
          <div className="personality-cards-container">
            {explorerTypes.map((type, index) => (
              <PersonalityCard
                key={type.id}
                image={type.image}
                title={type.title}
                subtitle={type.subtitle}
                description={type.description}
                delay={index * 200 + 1200}
              />
            ))}
          </div>
        </section>
      </main>

      <div className="floating-elements">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>
    </div>
  );
};

export default PersonalityPage;