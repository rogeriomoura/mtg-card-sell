# MTG Card Sell Helper

A TypeScript tool to analyze your Magic: The Gathering card collection and identify cards with high sell value potential.

## Features

- Read MTG card collections from CSV files
- Compare card values using external pricing APIs
- Identify sellable cards based on market data
- Built with TypeScript for type safety

## Installation

```bash
pnpm install
```

## Usage

1. Prepare your MTG card collection in CSV format
2. Run the application with your CSV file:

```bash
# Development mode
pnpm run dev <path-to-csv>

# Production mode
pnpm run build
pnpm start <path-to-csv>
```

Example:

```bash
pnpm run dev sample-collection.csv
```

## Scripts

- `pnpm run build` - Build the project
- `pnpm run start` - Run the built application
- `pnpm run dev` - Run in development mode with nodemon
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run lint` - Lint the codebase
- `pnpm run lint:fix` - Lint and auto-fix issues
- `pnpm run format` - Format code with Prettier
- `pnpm run format:check` - Check code formatting
- `pnpm run format-csv` - Format CSV files to standardized format

## CSV Format

The application expects CSV files in the following standardized format:
```
card name,edition,foil,quantity
```

### CSV Formatting Tool

If your CSV file uses different column names or formats, use the formatting tool:

```bash
pnpm run format-csv "input-file.csv" "output-file.csv"
```

Example:
```bash
pnpm run format-csv "Cards I own.csv" "formatted-cards.csv"
```

The formatter automatically:
- Maps various column names (Name/Card Name → card name, Set Name/Edition → edition)
- Converts foil values (foil/normal → true/false, 1/0 → true/false)
- Handles case-insensitive column detection
- Preserves quantity values

### Supported Input Formats

The formatter recognizes these column variations:
- **Card Name**: Name, Card Name, card name, name
- **Edition**: Set Name, Edition, Set, set name, edition, set  
- **Foil**: Foil, foil, is_foil (accepts: foil/normal, true/false, 1/0, yes/no)
- **Quantity**: Quantity, quantity, qty, Qty

## License

ISC
