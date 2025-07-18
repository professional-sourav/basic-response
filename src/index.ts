import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create server instance
const server = new McpServer({
    name: 'Fruit & Animal Search Server',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {
            basicResponse: {
                description: 'Search for fruits by name, color, season, or nutritional information'
            },
            basicResponseMultiBlock: {
                description: 'Returns response if you want to search for any animals'
            }
        }
    }
});

// Fruit database
const fruitDatabase = [
    { name: 'Apple', color: 'Red/Green', season: 'Fall', nutrition: 'High in fiber and vitamin C' },
    { name: 'Banana', color: 'Yellow', season: 'Year-round', nutrition: 'Rich in potassium and vitamin B6' },
    { name: 'Orange', color: 'Orange', season: 'Winter', nutrition: 'Excellent source of vitamin C' },
    { name: 'Strawberry', color: 'Red', season: 'Summer', nutrition: 'High in antioxidants and vitamin C' },
    { name: 'Blueberry', color: 'Blue', season: 'Summer', nutrition: 'Packed with antioxidants' },
    { name: 'Grape', color: 'Purple/Green', season: 'Fall', nutrition: 'Contains resveratrol and antioxidants' },
    { name: 'Pineapple', color: 'Yellow', season: 'Year-round', nutrition: 'Rich in vitamin C and enzymes' },
    { name: 'Mango', color: 'Orange/Yellow', season: 'Summer', nutrition: 'High in vitamin A and C' },
    { name: 'Watermelon', color: 'Green/Red', season: 'Summer', nutrition: 'High water content, lycopene' },
    { name: 'Kiwi', color: 'Brown/Green', season: 'Year-round', nutrition: 'Very high in vitamin C' }
];

const searchFruits = (query: string) => {
    if (!query || query.trim() === '') {
        return {
            results: fruitDatabase,
            message: 'Here are all available fruits:',
            count: fruitDatabase.length
        };
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Handle common misspellings
    const spellCorrections: { [key: string]: string } = {
        'bananna': 'banana',
        'bannana': 'banana',
        'bananana': 'banana',
        'aple': 'apple',
        'aplle': 'apple',
        'ornage': 'orange',
        'orang': 'orange',
        'strawbery': 'strawberry',
        'strawbberry': 'strawberry',
        'blubery': 'blueberry',
        'blueberrie': 'blueberry',
        'pinnapple': 'pineapple',
        'pineaple': 'pineapple',
        'mangoe': 'mango',
        'manggo': 'mango',
        'watermellon': 'watermelon',
        'watermelone': 'watermelon'
    };
    
    // Check if we need to correct the spelling
    const correctedTerm = spellCorrections[searchTerm] || searchTerm;
    
    const results = fruitDatabase.filter(fruit => 
        fruit.name.toLowerCase().includes(correctedTerm) ||
        fruit.color.toLowerCase().includes(correctedTerm) ||
        fruit.season.toLowerCase().includes(correctedTerm) ||
        fruit.nutrition.toLowerCase().includes(correctedTerm)
    );

    let message = '';
    if (results.length > 0) {
        if (correctedTerm !== searchTerm) {
            message = `Found ${results.length} fruit(s) for "${query}" (corrected to "${correctedTerm}"):`;
        } else {
            message = `Found ${results.length} fruit(s) matching "${query}":`;
        }
    } else {
        message = `No fruits found matching "${query}". Try searching for names, colors, seasons, or nutritional info.`;
    }

    return {
        results,
        message,
        count: results.length
    };
};

server.tool(
  'basicResponse',
  'Search for fruits by name, color, season, or nutritional information',
  { data: z.string().optional() },
  async ({ data }: { data?: string }) => {
    const searchResult = searchFruits(data || '');
    
    const content = [
        {
            type: "text" as const,
            text: searchResult.message
        }
    ];

    // Add each fruit result as a separate content block
    searchResult.results.forEach(fruit => {
        content.push({
            type: "text" as const,
            text: `🍎 **${fruit.name}**\n  Color: ${fruit.color}\n  Season: ${fruit.season}\n  Nutrition: ${fruit.nutrition}`
        });
    });

    // Add metadata
    content.push({
        type: "text" as const,
        text: `\n📊 **Search Summary**\nResults found: ${searchResult.count}\nTimestamp: ${new Date().toISOString()}\nSource: Fruit Search Engine`
    });
    
    return { content };
  }
);

server.tool(
  'basicResponseMultiBlock',
  'Returns response if you want to search for any animals',
  { state: z.string().optional() },
  async ({ state }: { state?: string }) => {
    const responseText = state || 'Default input';
    const timestamp = new Date().toISOString();
    const source = 'MCP Server';
    
    return {
      content: [
        {
          type: "text",
          text: responseText
        },
        {
          type: "text", 
          text: `Generated at ${timestamp} from ${source}`
        }
      ]
    };
  }
);

async function main() {
    // Create transport for server
    const transport = new StdioServerTransport();

    // Start the server
    await server.connect(transport);

    console.log('MCP Server is running and waiting for requests...');
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});