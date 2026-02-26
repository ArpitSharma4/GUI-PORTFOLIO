/**
 * worldData.js — All world object definitions.
 * Positions, NPC data, project data, skill info.
 * Coordinates are in world-space pixels (5500px world width).
 */

export const WORLD_CONFIG = {
    width: 5500,
    groundFraction: 0.72,   // ground Y as fraction of canvas height
    playerStart: 250,       // starting X for player
};

/**
 * Buildings / Houses — each is a project or workplace
 */
export const BUILDINGS = [
    {
        id: 'house-ml',
        type: 'house',
        x: 650,
        width: 160,
        height: 140,
        color: '#F4D9A0',
        roofColor: '#8B5E3C',
        label: 'ML Lab',
        project: {
            name: 'Machine Learning Research',
            description: 'Built predictive models using Python and TensorFlow. Worked on NLP-based text classification and computer vision pipelines for real-world datasets.',
            techStack: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn', 'OpenCV'],
            github: '#',
            live: '#',
        }
    },
    {
        id: 'house-web3',
        type: 'house',
        x: 1350,
        width: 150,
        height: 130,
        color: '#E8B4A0',
        roofColor: '#7A5040',
        label: 'Web3 Studio',
        project: {
            name: 'Web3 Decentralized App',
            description: 'Developed a decentralized application with smart contracts on Ethereum. Features include wallet integration, token swaps, and on-chain voting.',
            techStack: ['Solidity', 'React', 'Ethers.js', 'Hardhat', 'IPFS'],
            github: '#',
            live: '#',
        }
    },
    {
        id: 'dell-office',
        type: 'office',
        x: 2950,
        width: 200,
        height: 160,
        color: '#B0BEC5',
        roofColor: '#607D8B',
        label: 'Dell Technologies',
        project: {
            name: 'Dell Technologies',
            description: 'Currently working as an Automation Intern at Dell Technologies. Building internal tools for process automation, scripting CI/CD pipelines, and developing monitoring dashboards.',
            techStack: ['Python', 'Ansible', 'Jenkins', 'Docker', 'PowerShell'],
            github: null,
            live: null,
        }
    },
    {
        id: 'house-fullstack',
        type: 'house',
        x: 3750,
        width: 155,
        height: 135,
        color: '#A8D5BA',
        roofColor: '#5A8A65',
        label: 'Full Stack',
        project: {
            name: 'Full-Stack Web Application',
            description: 'A comprehensive web app with authentication, real-time data, and a responsive dashboard. Built with modern frameworks and deployed on cloud infrastructure.',
            techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Vercel'],
            github: '#',
            live: '#',
        }
    },
    {
        id: 'house-devops',
        type: 'house',
        x: 4450,
        width: 150,
        height: 125,
        color: '#C5B8D9',
        roofColor: '#6A5A80',
        label: 'Cloud Ops',
        project: {
            name: 'DevOps & Cloud Infrastructure',
            description: 'Designed and deployed a microservices architecture on AWS. Implemented CI/CD pipelines, container orchestration, and infrastructure-as-code.',
            techStack: ['AWS', 'Terraform', 'Kubernetes', 'GitHub Actions', 'Docker'],
            github: '#',
            live: '#',
        }
    }
];

/**
 * NPCs — positioned near buildings with speech lines
 */
export const NPCS = [
    {
        id: 'npc-tutorial',
        type: 'developer',
        x: 330,
        speech: "Welcome! Use arrow keys to explore Arpit's neighborhood. Press E near buildings to learn more!",
        direction: 1,
    },
    {
        id: 'npc-ml',
        type: 'developer',
        x: 580,
        speech: "You're heading toward Arpit's Machine Learning Projects. He loves building intelligent systems!",
        direction: 1,
    },
    {
        id: 'npc-web3',
        type: 'gardener',
        x: 1270,
        speech: "This house contains his Web3 work. Decentralized apps and smart contracts!",
        direction: -1,
    },
    {
        id: 'npc-dell',
        type: 'delivery',
        x: 2870,
        speech: "That's the Dell Technologies office. Arpit is working there as an Automation Intern!",
        direction: -1,
        isWalking: true,
        walkRange: 60,
    },
    {
        id: 'npc-fullstack',
        type: 'sweeper',
        x: 3680,
        speech: "A full-stack developer's workshop! React, Node, databases — the works.",
        direction: 1,
    },
    {
        id: 'npc-end',
        type: 'developer',
        x: 5200,
        speech: "Thanks for visiting Arpit's portfolio! Feel free to connect on LinkedIn or GitHub.",
        direction: -1,
    }
];

/**
 * Skills — placed in the park zone (1900-2800)
 */
export const SKILLS = [
    {
        id: 'skill-python',
        x: 2000,
        name: 'Python',
        icon: '🐍',
        color: '#3776AB',
        description: 'Primary language for ML, automation, scripting, and backend development.'
    },
    {
        id: 'skill-react',
        x: 2150,
        name: 'React',
        icon: '⚛️',
        color: '#61DAFB',
        description: 'Building interactive UIs with component-based architecture and hooks.'
    },
    {
        id: 'skill-ml',
        x: 2320,
        name: 'Machine Learning',
        icon: '🧠',
        color: '#FF6F00',
        description: 'Deep learning, NLP, computer vision, and model deployment.'
    },
    {
        id: 'skill-cloud',
        x: 2490,
        name: 'Cloud',
        icon: '☁️',
        color: '#4285F4',
        description: 'AWS, Azure, GCP — deploying and managing scalable cloud infrastructure.'
    },
    {
        id: 'skill-devops',
        x: 2660,
        name: 'DevOps',
        icon: '🔧',
        color: '#2496ED',
        description: 'CI/CD pipelines, Docker, Kubernetes, and infrastructure as code.'
    }
];

/**
 * Environment props — trees, fences, flowers, lamps, signs
 * These are decorative and may have foreground/background layers.
 */
export const ENVIRONMENT = {
    // Trees scattered throughout the world
    trees: [
        { x: 100, size: 1.0 },
        { x: 450, size: 0.85 },
        { x: 900, size: 1.1 },
        { x: 1100, size: 0.9 },
        { x: 1600, size: 1.0 },
        { x: 1850, size: 0.8 },
        { x: 1950, size: 1.2 },
        { x: 2100, size: 0.7 },
        { x: 2250, size: 0.95 },
        { x: 2400, size: 1.1 },
        { x: 2550, size: 0.85 },
        { x: 2750, size: 1.0 },
        { x: 3200, size: 0.9 },
        { x: 3500, size: 1.15 },
        { x: 3950, size: 0.8 },
        { x: 4200, size: 1.0 },
        { x: 4700, size: 0.95 },
        { x: 4900, size: 1.1 },
        { x: 5100, size: 0.85 },
        { x: 5350, size: 0.9 },
    ],

    // Fences (between sections)
    fences: [
        { x: 180, width: 250 },
        { x: 1150, width: 80 },
        { x: 3300, width: 120 },
        { x: 4100, width: 100 },
        { x: 4680, width: 200 },
    ],

    // Flowers (clusters)
    flowers: [
        { x: 140, count: 4, spread: 30 },
        { x: 500, count: 3, spread: 25 },
        { x: 1200, count: 5, spread: 40 },
        { x: 1700, count: 3, spread: 20 },
        { x: 2050, count: 6, spread: 50 },
        { x: 2350, count: 4, spread: 35 },
        { x: 2700, count: 3, spread: 25 },
        { x: 3400, count: 5, spread: 40 },
        { x: 4000, count: 3, spread: 30 },
        { x: 4800, count: 4, spread: 35 },
        { x: 5250, count: 3, spread: 25 },
    ],

    // Lamp posts
    lamps: [
        { x: 480 },
        { x: 1150 },
        { x: 1800 },
        { x: 2450 },
        { x: 3150 },
        { x: 3600 },
        { x: 4350 },
        { x: 5050 },
    ],

    // Signs
    signs: [
        { x: 200, text: "Welcome to\nArpit's Neighborhood!" },
        { x: 1950, text: "🌳 Skills Park" },
        { x: 5150, text: "Thanks for\nvisiting!" },
    ],

    // Benches in park area
    benches: [
        { x: 2080 },
        { x: 2380 },
        { x: 2600 },
    ]
};
