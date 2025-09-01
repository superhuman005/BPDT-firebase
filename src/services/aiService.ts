
interface PredictiveTextResponse {
  suggestions: string[];
}

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generatePredictiveText(
    fieldType: string, 
    currentText: string, 
    companyName?: string, 
    industry?: string
  ): Promise<string[]> {
    // Analyze current text to provide more relevant suggestions
    const context = this.analyzeContext(currentText, companyName, industry);
    const predictions = this.getContextualPredictions(fieldType, currentText, context);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Shuffle and return more suggestions
    return this.shuffleArray(predictions).slice(0, 6);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private analyzeContext(currentText: string, companyName?: string, industry?: string) {
    const words = currentText.toLowerCase().split(/\s+/);
    const context = {
      companyName: companyName || '',
      industry: industry || '',
      hasFinancialTerms: words.some(word => ['revenue', 'profit', 'cost', 'investment', 'funding', 'roi', 'margin', 'cash', 'budget'].includes(word)),
      hasMarketTerms: words.some(word => ['market', 'customer', 'target', 'segment', 'competition', 'audience', 'demographic', 'niche'].includes(word)),
      hasTechTerms: words.some(word => ['technology', 'platform', 'software', 'digital', 'automation', 'ai', 'cloud', 'data'].includes(word)),
      hasGrowthTerms: words.some(word => ['scale', 'expand', 'growth', 'development', 'innovation', 'strategy'].includes(word)),
      textLength: currentText.length,
      lastSentence: this.getLastSentence(currentText)
    };
    
    return context;
  }

  private getLastSentence(text: string): string {
    const sentences = text.split(/[.!?]+/);
    return sentences[sentences.length - 1]?.trim() || '';
  }

  private getContextualPredictions(
    fieldType: string, 
    currentText: string, 
    context: any
  ): string[] {
    // Generate a large pool of suggestions to choose from
    let allSuggestions: string[] = [];
    
    // If text is empty, provide starter suggestions
    if (!currentText.trim()) {
      allSuggestions = this.getExpandedStarterSuggestions(fieldType, context.companyName, context.industry);
    }
    // If text is short, provide continuation suggestions
    else if (currentText.length < 200) {
      allSuggestions = this.getExpandedContinuationSuggestions(fieldType, context);
    }
    // For longer text, provide enhancement suggestions
    else {
      allSuggestions = this.getExpandedEnhancementSuggestions(fieldType, context);
    }

    // Add some random variations and alternative approaches
    allSuggestions = [...allSuggestions, ...this.getRandomVariations(fieldType, context)];
    
    return allSuggestions;
  }

  private getExpandedStarterSuggestions(fieldType: string, companyName?: string, industry?: string): string[] {
    const companyRef = companyName || 'Our company';
    const industryContext = industry || 'technology';
    
    const expandedStarters: Record<string, string[]> = {
      companyName: [
        `${companyRef} represents a revolutionary approach to ${industry || 'modern business'}, combining cutting-edge innovation with proven market strategies to deliver exceptional value to our customers while maintaining sustainable growth and operational excellence.`,
        `Founded on the principles of innovation and customer-centricity, ${companyRef} has emerged as a pioneering force in the ${industry || 'industry'}, leveraging advanced technologies and strategic partnerships to create transformative solutions that address complex market challenges.`,
        `${companyRef} stands at the forefront of ${industry || 'technological advancement'}, where our team of experienced professionals works tirelessly to develop comprehensive solutions that not only meet current market demands but anticipate future trends and opportunities.`
      ],
      sector: [
        `The ${industry || 'technology'} sector presents unprecedented opportunities for growth and innovation, driven by rapidly evolving consumer demands, technological breakthroughs, and shifting market dynamics that create new possibilities for disruptive business models and strategic partnerships.`,
        `Operating within the dynamic ${industry || 'business'} landscape, we've identified significant gaps in the market where traditional approaches fall short, creating substantial opportunities for innovative companies to establish strong competitive positions through differentiated value propositions.`,
        `Our analysis of the ${industry || 'current'} sector reveals emerging trends including digital transformation, sustainability initiatives, and customer experience optimization, which collectively represent a multi-billion dollar opportunity for forward-thinking organizations.`
      ],
      productsServices: [
        `Our comprehensive suite of products and services has been meticulously designed to address the evolving needs of modern businesses, incorporating advanced technologies, user-centric design principles, and scalable architectures that adapt to changing market conditions and customer requirements.`,
        `We offer an integrated ecosystem of innovative solutions that seamlessly combine hardware, software, and service components to deliver unparalleled value to our clients, enabling them to achieve operational efficiency, cost optimization, and sustainable competitive advantages in their respective markets.`,
        `Our product portfolio encompasses cutting-edge technologies and proven methodologies that have been refined through extensive market research, customer feedback, and continuous innovation cycles, resulting in solutions that consistently exceed performance expectations and deliver measurable business outcomes.`
      ],
      purposeValue: [
        `Our fundamental purpose centers on transforming how businesses operate in the digital age by providing innovative solutions that bridge the gap between traditional practices and emerging technologies, creating sustainable value for all stakeholders while contributing to positive societal impact.`,
        `We exist to empower organizations of all sizes to harness the full potential of modern technology and strategic thinking, enabling them to overcome complex challenges, capitalize on market opportunities, and build resilient business models that thrive in dynamic competitive environments.`,
        `Our core mission revolves around democratizing access to advanced business solutions and technological capabilities, ensuring that companies across diverse industries can leverage world-class tools and expertise to accelerate their growth trajectories and achieve long-term success.`
      ],
      managementTeam: [
        `Our leadership team brings together over 150 years of combined experience across multiple industries, including technology, finance, operations, and strategic consulting, with proven track records of building successful companies, leading digital transformations, and delivering exceptional results in competitive markets.`,
        `The management team consists of seasoned executives who have previously held senior positions at Fortune 500 companies, successful startups, and leading consulting firms, bringing diverse perspectives, extensive networks, and deep domain expertise to drive strategic decision-making and operational excellence.`,
        `Our diverse leadership group combines technical expertise with business acumen, featuring former CTOs, VPs of Sales, Operations Directors, and Strategy Consultants who collectively possess the skills, experience, and vision necessary to navigate complex market dynamics and execute ambitious growth strategies.`
      ],
      businessDescription: [
        `${companyRef} is a next-generation ${industry || 'technology'} company that specializes in developing and deploying innovative solutions designed to address critical market inefficiencies and unlock new value creation opportunities for businesses across multiple industry verticals, leveraging advanced analytics, automation, and strategic partnerships.`,
        `We operate as a comprehensive solutions provider in the ${industry || 'business'} space, offering an integrated platform that combines proprietary technology, expert consulting services, and strategic advisory capabilities to help organizations optimize their operations, enhance customer experiences, and achieve sustainable competitive advantages.`,
        `${companyRef} represents a unique convergence of cutting-edge technology and deep industry expertise, focused on creating transformative solutions that enable businesses to adapt to rapidly changing market conditions while maintaining operational efficiency and delivering superior customer value propositions.`
      ]
    };

    return expandedStarters[fieldType] || this.getGenericExpandedStarters(fieldType, companyRef, industryContext);
  }

  private getGenericExpandedStarters(fieldType: string, companyRef: string, industry: string): string[] {
    return [
      `In today's rapidly evolving business landscape, ${companyRef} has positioned itself as a catalyst for transformation within the ${industry} sector, leveraging innovative approaches and strategic thinking to create sustainable competitive advantages while delivering exceptional value to customers and stakeholders.`,
      `Our comprehensive approach to ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()} encompasses multiple dimensions of business strategy, operational excellence, and market positioning, ensuring that we maintain leadership positions while adapting to changing market dynamics and emerging opportunities.`,
      `Through careful analysis of market trends, customer needs, and competitive landscapes, ${companyRef} has developed a robust framework for ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()} that incorporates best practices, innovative methodologies, and proven strategies to achieve sustainable growth and long-term success.`,
      `The foundation of our ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()} rests on deep industry knowledge, extensive market research, and strategic partnerships that enable us to deliver comprehensive solutions while maintaining flexibility to adapt to evolving market conditions and customer requirements.`,
      `Our strategic approach to ${fieldType.replace(/([A-Z])/g, ' $1').toLowerCase()} integrates cutting-edge technologies with time-tested business principles, creating a unique value proposition that addresses both current market needs and anticipates future trends and opportunities in the ${industry} sector.`
    ];
  }

  private getExpandedContinuationSuggestions(fieldType: string, context: any): string[] {
    const continuations: string[] = [];
    
    // Market-focused continuations
    if (context.hasMarketTerms || fieldType.includes('market') || fieldType.includes('Market')) {
      continuations.push(
        'This market positioning creates significant opportunities for strategic partnerships, customer acquisition, and revenue diversification, while our comprehensive market research indicates strong demand for innovative solutions that address current gaps in service delivery and customer experience.',
        'Our extensive market analysis reveals multiple untapped segments with substantial growth potential, supported by favorable demographic trends, regulatory changes, and technological advancements that align perfectly with our core competencies and strategic objectives.',
        'The competitive landscape analysis demonstrates clear differentiation opportunities where our unique value proposition can capture market share through superior customer experience, innovative product features, and strategic pricing models that deliver exceptional value.',
        'Market validation through customer interviews, pilot programs, and industry partnerships confirms strong demand for our solutions, with early adopters reporting significant improvements in operational efficiency, cost reduction, and customer satisfaction metrics.'
      );
    }
    
    // Technology-focused continuations
    if (context.hasTechTerms || fieldType.includes('technology') || fieldType.includes('platform')) {
      continuations.push(
        'Our technology infrastructure is built on scalable, cloud-native architectures that support rapid growth while maintaining security, reliability, and performance standards that exceed industry benchmarks, ensuring seamless user experiences across all touchpoints.',
        'The platform leverages artificial intelligence, machine learning algorithms, and advanced analytics to provide predictive insights, automated decision-making capabilities, and personalized user experiences that adapt to individual preferences and behavioral patterns.',
        'Integration capabilities span multiple protocols, APIs, and data formats, enabling seamless connectivity with existing enterprise systems while providing robust security measures, data encryption, and compliance frameworks that meet industry standards.',
        'Our technical roadmap includes continuous innovation cycles, regular platform updates, and emerging technology adoption strategies that ensure long-term competitiveness while maintaining backward compatibility and system stability.'
      );
    }
    
    // Financial-focused continuations
    if (context.hasFinancialTerms || fieldType.includes('financial') || fieldType.includes('revenue')) {
      continuations.push(
        'Financial projections are based on conservative market assumptions, extensive competitive analysis, and proven business models that have demonstrated success in similar markets, with multiple revenue streams providing stability and growth potential.',
        'Our economic model incorporates detailed cost structures, pricing strategies, and profitability timelines that account for customer acquisition costs, operational expenses, and market development investments while maintaining healthy unit economics.',
        'Revenue diversification strategies include subscription models, transaction fees, premium services, and strategic partnerships that create multiple income streams while reducing dependency on any single revenue source or customer segment.',
        'Investment requirements have been carefully calculated based on operational needs, technology development costs, marketing expenses, and working capital requirements, with clear milestones and performance metrics tied to funding stages.'
      );
    }
    
    // Growth and strategy continuations
    if (context.hasGrowthTerms || fieldType.includes('strategy') || fieldType.includes('growth')) {
      continuations.push(
        'Our growth strategy encompasses organic expansion through customer acquisition and retention, strategic partnerships with industry leaders, and selective acquisitions that complement our core capabilities while expanding market reach and technical expertise.',
        'Scalability planning includes operational process optimization, technology infrastructure expansion, team development programs, and strategic resource allocation that supports sustainable growth while maintaining service quality and customer satisfaction.',
        'Market expansion opportunities span geographic regions, industry verticals, and customer segments, with detailed go-to-market strategies, localization requirements, and partnership frameworks that minimize risk while maximizing growth potential.',
        'Success metrics and key performance indicators have been established to track progress across customer acquisition, revenue growth, operational efficiency, and market penetration, with regular review cycles and adjustment mechanisms built into our strategic planning process.'
      );
    }
    
    // Add some general high-quality continuations if none of the above matched
    if (continuations.length === 0) {
      continuations.push(
        'This strategic approach ensures sustainable competitive advantages through continuous innovation, customer-centric design principles, and operational excellence that consistently delivers superior value propositions while maintaining flexibility to adapt to changing market conditions.',
        'Implementation strategies incorporate phased rollouts, risk mitigation protocols, and performance monitoring systems that enable rapid iteration and optimization based on real-world feedback and market response data.',
        'Our comprehensive framework includes detailed timelines, resource allocation plans, and success metrics that provide clear visibility into progress while maintaining accountability across all functional areas and stakeholder groups.',
        'Success factors include strong leadership commitment, cross-functional collaboration, strategic partner alignment, and continuous learning mechanisms that support both short-term execution and long-term strategic objectives.'
      );
    }
    
    return continuations;
  }

  private getExpandedEnhancementSuggestions(fieldType: string, context: any): string[] {
    const enhancements: string[] = [];
    
    // Add comprehensive enhancements based on missing elements
    if (!context.hasFinancialTerms && ['business', 'financial', 'funding', 'revenue'].some(term => fieldType.toLowerCase().includes(term))) {
      enhancements.push(
        'Furthermore, our comprehensive financial model demonstrates robust unit economics with customer lifetime values significantly exceeding acquisition costs, supported by detailed sensitivity analyses and scenario planning that account for various market conditions and competitive responses.',
        'Key financial performance indicators include monthly recurring revenue growth rates, gross margin expansion, customer churn reduction, and cash flow optimization metrics that collectively demonstrate sustainable business model viability and scalability potential.',
        'Investment allocation strategies prioritize high-impact initiatives across product development, market expansion, and operational scaling, with clear ROI expectations and milestone-based funding releases that minimize risk while maximizing growth opportunities.'
      );
    }
    
    if (!context.hasMarketTerms && ['market', 'customer', 'competitive'].some(term => fieldType.toLowerCase().includes(term))) {
      enhancements.push(
        'Market research validates our assumptions through comprehensive customer surveys, competitive intelligence gathering, and industry expert interviews that confirm significant unmet demand and favorable competitive positioning for our differentiated solutions.',
        'Customer segmentation analysis reveals multiple high-value target markets with distinct needs, preferences, and willingness-to-pay characteristics that enable tailored value propositions and optimized go-to-market strategies for each segment.',
        'Competitive differentiation strategies leverage our unique strengths in technology innovation, customer experience design, and strategic partnerships to create sustainable advantages that are difficult for competitors to replicate.'
      );
    }
    
    if (!context.hasTechTerms && ['technology', 'platform', 'solution'].some(term => fieldType.toLowerCase().includes(term))) {
      enhancements.push(
        'Technology implementation follows industry best practices for security, scalability, and performance optimization, incorporating DevOps methodologies, continuous integration pipelines, and automated testing frameworks that ensure reliable product delivery.',
        'Our technical architecture supports multi-tenancy, API-first design principles, and microservices patterns that enable rapid feature development, seamless integrations, and flexible deployment options across cloud and on-premise environments.',
        'Innovation roadmaps include emerging technology evaluation, prototype development, and strategic technology partnerships that ensure our solutions remain at the forefront of industry advancement while meeting evolving customer requirements.'
      );
    }
    
    // Add strategic and operational enhancements
    enhancements.push(
      'Strategic partnerships with industry leaders, technology providers, and distribution channels create synergistic opportunities for market expansion, capability enhancement, and customer value creation while reducing competitive threats and market entry barriers.',
      'Risk management frameworks address operational, market, financial, and technology risks through comprehensive mitigation strategies, contingency planning, and insurance coverage that protect business continuity and stakeholder interests.',
      'Performance monitoring systems track key success metrics across customer satisfaction, operational efficiency, financial performance, and market position, enabling data-driven decision making and continuous optimization of business strategies.',
      'Organizational development initiatives focus on talent acquisition, skills development, culture building, and leadership succession planning that support sustainable growth while maintaining high-performance standards and employee engagement.',
      'Quality assurance processes encompass product development, service delivery, and customer experience management through systematic testing, feedback collection, and continuous improvement methodologies that ensure consistent excellence.',
      'Sustainability initiatives integrate environmental responsibility, social impact, and governance best practices into business operations, creating long-term value for stakeholders while contributing to positive societal outcomes.',
      'Innovation processes include idea generation, concept validation, prototype development, and market testing methodologies that systematically identify and develop new opportunities while managing development risks and resource allocation.'
    );
    
    return enhancements;
  }

  private getRandomVariations(fieldType: string, context: any): string[] {
    const variations: string[] = [];
    const companyRef = context.companyName || 'Our organization';
    const industryRef = context.industry || 'our industry';
    
    // Generate field-specific variations with more creativity
    const variationTemplates = [
      `${companyRef} leverages advanced methodologies and proven frameworks to deliver exceptional results that consistently exceed stakeholder expectations while maintaining operational efficiency and sustainable growth trajectories across multiple market segments and geographic regions.`,
      `Through strategic analysis and comprehensive market research, we have identified significant opportunities for value creation that align with emerging industry trends, customer preferences, and technological capabilities, positioning us for accelerated growth and market leadership.`,
      `Our innovative approach combines traditional business principles with cutting-edge technologies and creative problem-solving methodologies to develop solutions that address complex challenges while creating sustainable competitive advantages in dynamic market environments.`,
      `Implementation strategies incorporate best practices from multiple industries, academic research, and expert consultation to ensure optimal outcomes while minimizing risks and maximizing return on investment across all business functions and strategic initiatives.`,
      `Success metrics and performance indicators have been carefully selected to provide comprehensive visibility into business performance while enabling rapid course corrections and strategic optimizations based on real-time market feedback and competitive intelligence.`,
      `Our comprehensive framework addresses multiple stakeholder needs through integrated solutions that balance short-term performance requirements with long-term strategic objectives, ensuring sustainable value creation and organizational resilience.`,
      `Market dynamics analysis reveals emerging opportunities for disruption and innovation that align perfectly with our core competencies, strategic vision, and available resources, creating multiple pathways for accelerated growth and market expansion.`,
      `Operational excellence initiatives focus on process optimization, technology integration, and performance measurement systems that drive continuous improvement while maintaining service quality and customer satisfaction at industry-leading levels.`
    ];
    
    // Add some randomness and shuffle the variations
    const shuffledVariations = this.shuffleArray(variationTemplates);
    variations.push(...shuffledVariations.slice(0, 4));
    
    return variations;
  }
}
