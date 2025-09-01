# TTS CLI Test Suite

Comprehensive test suite for the Text-to-Speech CLI tool built with Bun.

## Test Coverage

### Unit Tests

1. **Argument Parsing** (`parseArgs.test.ts`)
   - Text argument parsing
   - Voice selection
   - Output file handling
   - Flag parsing (--check, --list-voices, --help)
   - Rate and pitch parameters
   - Edge cases and missing values

2. **Help Display** (`help.test.ts`)
   - Help text generation
   - Usage information
   - Options documentation
   - Examples inclusion

3. **Format Utilities** (`format.test.ts`)
   - Text truncation with ellipsis
   - Voice list formatting
   - Language grouping
   - Display limits

4. **Audio Commands** (`audio.test.ts`)
   - Platform-specific command generation
   - macOS (afplay)
   - Windows (PowerShell)
   - Linux (multiple fallbacks)
   - File path handling

### Integration Tests

5. **TTS Synthesis** (`integration.test.ts`)
   - Speech synthesis with various settings
   - Different voices
   - Rate and pitch adjustments
   - Long text handling
   - Special characters and numbers
   - File saving

6. **CLI Integration** (`integration.test.ts`)
   - Command-line execution
   - Help display
   - System checks
   - Voice listing
   - File generation
   - Custom parameters

### Error Handling

7. **Error Scenarios** (`errors.test.ts`)
   - Invalid voice names
   - Empty text handling
   - Invalid rate/pitch formats
   - Extremely long text
   - Missing argument values
   - Invalid file paths
   - Conflicting flags
   - Out-of-bounds parameters

## Running Tests

```bash
# Run all tests
bun test

# Watch mode for development
bun test --watch

# Generate coverage report
bun test --coverage

# Run specific test file
bun test tests/parseArgs.test.ts

# Run tests matching pattern
bun test --grep "should handle"
```

## Test Statistics

- **Total Tests**: 70
- **Test Files**: 6
- **Pass Rate**: 100%
- **Execution Time**: ~30 seconds

## Key Testing Patterns

1. **Isolation**: Functions extracted to `src/lib.ts` for better testability
2. **Mocking**: Using Bun's built-in mock utilities where needed
3. **Cleanup**: Proper cleanup of temporary files in integration tests
4. **Timeouts**: Extended timeouts for network-dependent tests
5. **Edge Cases**: Comprehensive coverage of boundary conditions

## CI/CD Integration

Tests are designed to run in CI environments with:
- No interactive prompts
- Automatic cleanup of test artifacts
- Clear pass/fail status
- Detailed error reporting