# UNIVERSAL TESTING PLAYBOOK
## Comprehensive Testing Strategy for Any Claude Code Project

**Version:** 1.0  
**Last Updated:** December 21, 2025  
**Applies To:** All projects built with Claude Code  
**Philosophy:** Test everything, test thoroughly, automate completely

---

## 🎯 CORE TESTING PHILOSOPHY

### Universal Principles (Language/Framework Agnostic)

1. **Test Before Deploy** - Nothing reaches production untested
2. **Test After Every Change** - Code → Test → Commit cycle
3. **Test All Layers** - Unit → Integration → E2E
4. **Test All Scenarios** - Happy path + edge cases + failures
5. **Automate Everything** - Manual tests = technical debt
6. **Test Coverage ≥ 80%** - Non-negotiable minimum

### The Testing Pyramid (Universal)

```
        ┌─────────────┐
        │   E2E (5%)  │  ← Full system flows
        ├─────────────┤
        │ Integration │  ← Multi-component
        │   (25%)     │
        ├─────────────┤
        │    Unit     │  ← Individual functions
        │   (70%)     │
        └─────────────┘
```

**Why this distribution?**
- Unit tests: Fast, isolated, easy to debug
- Integration: Verify components work together
- E2E: Validate complete user flows

---

## 📋 TEST CATEGORIES (Universal)

### 1. UNIT TESTS (70% of total)

**What:** Test individual functions/methods/classes in isolation  
**When:** After writing ANY new function  
**Speed:** <1s per test  
**Coverage Target:** 80%+ overall, 100% for critical paths

**Common Patterns:**
```
✅ Pure functions (input → output, no side effects)
✅ Business logic
✅ Data transformations
✅ Validation functions
✅ Utilities and helpers
```

---

### 2. INTEGRATION TESTS (25% of total)

**What:** Test multiple components working together  
**When:** After completing a feature  
**Speed:** <10s per test  
**Coverage Target:** 100% of component interactions

**Common Patterns:**
```
✅ API endpoint + database
✅ Service + external API
✅ Multiple modules coordinating
✅ Authentication flow
✅ Payment processing flow
```

---

### 3. END-TO-END TESTS (5% of total)

**What:** Test complete user journeys  
**When:** Before deployment  
**Speed:** <60s per test  
**Coverage Target:** Critical user flows only

**Common Patterns:**
```
✅ User registration → login → use feature
✅ Purchase flow (browse → cart → checkout)
✅ Content creation → publish → view
✅ Admin workflows
```

---

### 4. PERFORMANCE TESTS

**What:** Measure speed, load, resource usage  
**When:** Weekly + before major releases  
**Tool-Agnostic Metrics:**
- Response time (API: <500ms, Page load: <2s)
- Throughput (requests/second)
- Resource usage (CPU, memory, disk)
- Concurrent users supported

---

### 5. ERROR HANDLING TESTS

**What:** Verify graceful failure  
**When:** After implementing error handling  
**Coverage Target:** 100% of error paths

**Common Scenarios:**
```
✅ Network failures (timeout, connection refused)
✅ Invalid input (malformed data, out of range)
✅ Authentication failures (401, 403)
✅ Rate limiting (429)
✅ Server errors (500, 503)
✅ Database failures (connection lost, constraint violation)
```

---

## 🛠️ TECHNOLOGY-SPECIFIC GUIDES

### PYTHON PROJECTS

#### Test Structure

```
project/
├── src/
│   └── myapp/
│       ├── __init__.py
│       ├── models.py
│       ├── services.py
│       └── api.py
│
└── tests/
    ├── __init__.py
    ├── conftest.py           # Shared fixtures
    ├── unit/
    │   ├── test_models.py
    │   ├── test_services.py
    │   └── test_utils.py
    ├── integration/
    │   ├── test_api.py
    │   └── test_database.py
    └── e2e/
        └── test_user_flows.py
```

#### Tools

```bash
# Essential testing stack
pytest              # Test runner
pytest-cov          # Coverage reporting
pytest-mock         # Mocking utilities
pytest-asyncio      # Async test support
pytest-benchmark    # Performance testing
pytest-html         # HTML reports
faker               # Test data generation
```

#### Pytest Configuration (pytest.ini)

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

addopts = 
    -v
    --strict-markers
    --tb=short
    --cov=src
    --cov-report=term-missing
    --cov-report=html
    --cov-fail-under=80

markers =
    slow: marks tests as slow
    integration: integration tests
    e2e: end-to-end tests
```

#### Example Unit Test Template

```python
import pytest
from unittest.mock import Mock, patch

class TestYourComponent:
    """Test suite for YourComponent"""
    
    def test_basic_functionality(self):
        """Component performs basic operation correctly"""
        # ARRANGE
        component = YourComponent()
        input_data = {"key": "value"}
        
        # ACT
        result = component.process(input_data)
        
        # ASSERT
        assert result["status"] == "success"
        assert "output" in result
    
    def test_edge_case_empty_input(self):
        """Component handles empty input gracefully"""
        component = YourComponent()
        
        with pytest.raises(ValueError):
            component.process({})
    
    @patch('external_api.Client')
    def test_external_api_integration(self, mock_api):
        """Component calls external API correctly"""
        mock_api.return_value.fetch.return_value = {"data": "test"}
        
        component = YourComponent()
        result = component.fetch_external_data()
        
        assert mock_api.called
        assert result["data"] == "test"
```

---

### TYPESCRIPT/JAVASCRIPT PROJECTS

#### Test Structure

```
project/
├── src/
│   ├── components/
│   ├── services/
│   └── utils/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

#### Tools

```bash
# For Node.js backend
npm install --save-dev jest @types/jest ts-jest
npm install --save-dev supertest @types/supertest

# For React frontend
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
```

#### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Example Test Template

```typescript
import { describe, it, expect, jest } from '@jest/globals';

describe('YourService', () => {
  it('should process data correctly', () => {
    // ARRANGE
    const service = new YourService();
    const input = { value: 42 };
    
    // ACT
    const result = service.process(input);
    
    // ASSERT
    expect(result.status).toBe('success');
    expect(result.value).toBe(42);
  });
  
  it('should handle errors gracefully', () => {
    const service = new YourService();
    
    expect(() => service.process(null))
      .toThrow('Invalid input');
  });
  
  it('should call external API', async () => {
    // ARRANGE
    const mockFetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ data: 'test' })
    });
    global.fetch = mockFetch;
    
    // ACT
    const service = new YourService();
    const result = await service.fetchData();
    
    // ASSERT
    expect(mockFetch).toHaveBeenCalled();
    expect(result.data).toBe('test');
  });
});
```

---

### REACT PROJECTS

#### Testing Library Approach

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly with props', () => {
    render(<YourComponent title="Test" />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const handleClick = jest.fn();
    render(<YourComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('updates UI based on state', async () => {
    render(<YourComponent />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello');
    
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});
```

---

### API/BACKEND PROJECTS

#### FastAPI Example

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health_check():
    """GET /health returns 200"""
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_api_create_resource():
    """POST /resources creates new resource"""
    data = {"name": "Test", "value": 42}
    response = client.post("/resources", json=data)
    
    assert response.status_code == 201
    assert response.json()["id"] is not None

def test_api_authentication_required():
    """Protected endpoint returns 401 without auth"""
    response = client.get("/protected")
    
    assert response.status_code == 401
```

#### Express.js Example

```typescript
import request from 'supertest';
import app from '../src/app';

describe('API Endpoints', () => {
  it('GET /health returns 200', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });
  
  it('POST /users creates user', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    const response = await request(app)
      .post('/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

### DATABASE TESTING

#### Pattern 1: In-Memory Database (Fast)

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="function")
def test_db():
    """Create in-memory SQLite database for tests"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    
    yield session
    
    session.close()
    Base.metadata.drop_all(engine)

def test_database_operations(test_db):
    """Test CRUD operations"""
    user = User(name="Test", email="test@example.com")
    test_db.add(user)
    test_db.commit()
    
    retrieved = test_db.query(User).filter_by(email="test@example.com").first()
    assert retrieved.name == "Test"
```

#### Pattern 2: Docker Test Database (Realistic)

```python
import pytest
import docker

@pytest.fixture(scope="session")
def postgres_container():
    """Start PostgreSQL container for tests"""
    client = docker.from_env()
    container = client.containers.run(
        "postgres:15",
        environment={"POSTGRES_PASSWORD": "test"},
        ports={"5432/tcp": 5433},
        detach=True
    )
    
    yield container
    
    container.stop()
    container.remove()
```

---

## 🧪 UNIVERSAL TEST PATTERNS

### Pattern 1: Arrange-Act-Assert (AAA)

**The golden rule of test structure:**

```python
def test_function_behavior():
    # ARRANGE - Set up test conditions
    input_data = create_test_data()
    expected_output = calculate_expected()
    
    # ACT - Execute the code being tested
    actual_output = function_under_test(input_data)
    
    # ASSERT - Verify the results
    assert actual_output == expected_output
```

**Why it works:**
- Clear separation of setup, execution, verification
- Easy to read and understand
- Maintainable over time

---

### Pattern 2: Test Fixtures

**Reusable test setup:**

```python
# Python (pytest)
@pytest.fixture
def sample_user():
    return User(id=1, name="Test", email="test@example.com")

def test_user_update(sample_user):
    sample_user.update_email("new@example.com")
    assert sample_user.email == "new@example.com"
```

```typescript
// TypeScript (Jest)
beforeEach(() => {
  // Setup runs before each test
  mockDatabase.clear();
  sampleUser = new User(1, 'Test', 'test@example.com');
});

afterEach(() => {
  // Cleanup runs after each test
  mockDatabase.reset();
});
```

---

### Pattern 3: Mocking External Dependencies

**Don't call real APIs in tests:**

```python
from unittest.mock import Mock, patch

@patch('requests.get')
def test_api_integration(mock_get):
    """Test without hitting real API"""
    # Setup mock response
    mock_get.return_value.json.return_value = {"data": "test"}
    mock_get.return_value.status_code = 200
    
    # Test your code
    result = fetch_external_data()
    
    # Verify behavior
    assert mock_get.called
    assert result["data"] == "test"
```

---

### Pattern 4: Parameterized Tests

**Test multiple inputs efficiently:**

```python
@pytest.mark.parametrize("input,expected", [
    (0, "zero"),
    (1, "one"),
    (2, "two"),
    (10, "many"),
    (-1, "negative"),
])
def test_number_to_word(input, expected):
    """Test conversion with various inputs"""
    assert number_to_word(input) == expected
```

```typescript
describe.each([
  [0, 'zero'],
  [1, 'one'],
  [2, 'two'],
  [10, 'many'],
])('numberToWord(%i)', (input, expected) => {
  it(`returns ${expected}`, () => {
    expect(numberToWord(input)).toBe(expected);
  });
});
```

---

### Pattern 5: Testing Async Code

**Python (async/await):**

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """Test async operations"""
    result = await fetch_data_async()
    assert result["status"] == "success"
```

**TypeScript (Promises):**

```typescript
it('should handle async operations', async () => {
  const result = await fetchDataAsync();
  expect(result.status).toBe('success');
});
```

---

### Pattern 6: Error Testing

**Verify error handling:**

```python
def test_raises_error_on_invalid_input():
    """Function raises ValueError for invalid input"""
    with pytest.raises(ValueError, match="must be positive"):
        process_value(-1)
```

```typescript
it('should throw error for invalid input', () => {
  expect(() => processValue(-1))
    .toThrow('must be positive');
});
```

---

## 📊 COVERAGE REQUIREMENTS

### Minimum Coverage Targets (Universal)

```
Overall Project:    80%
├── Critical Path:  100% (auth, payments, core business logic)
├── API Routes:     100%
├── Services:       90%
├── Models:         80%
├── Utils:          80%
└── UI Components:  70%
```

### How to Measure

**Python:**
```bash
pytest --cov=src --cov-report=html
open htmlcov/index.html
```

**TypeScript:**
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### What to Cover

**✅ ALWAYS test:**
- Public API methods
- Business logic
- Data transformations
- Validation functions
- Error handling
- Edge cases

**⚠️ OPTIONAL (low priority):**
- Private helper methods (if covered by public method tests)
- Trivial getters/setters
- Framework boilerplate

**❌ DON'T test:**
- Third-party library internals
- Generated code
- Configuration files

---

## 🎯 TEST NAMING CONVENTIONS

### Good Test Names

**Pattern:** `test_<what>_<when>_<expected>`

```python
✅ test_user_registration_with_valid_email_creates_account()
✅ test_payment_processing_when_card_declined_returns_error()
✅ test_search_with_empty_query_returns_all_results()

❌ test_1()
❌ test_user()
❌ test_works()
```

### Naming Guidelines

1. **Descriptive** - Anyone should understand what's tested
2. **Specific** - Include the condition being tested
3. **Action-oriented** - Use verbs (creates, returns, raises, updates)
4. **No abbreviations** - Clarity > brevity

---

## 🔍 TEST DATA MANAGEMENT

### Pattern 1: Factories

**Python (factory_boy):**

```python
import factory

class UserFactory(factory.Factory):
    class Meta:
        model = User
    
    name = factory.Faker('name')
    email = factory.Faker('email')
    age = factory.Faker('random_int', min=18, max=100)

# Usage
def test_user_creation():
    user = UserFactory()
    assert user.email is not None
```

### Pattern 2: Fixtures

**JSON fixtures:**

```json
// tests/fixtures/sample_user.json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "created_at": "2025-01-01T00:00:00Z"
}
```

```python
import json

def load_fixture(filename):
    with open(f"tests/fixtures/{filename}") as f:
        return json.load(f)

def test_with_fixture():
    user_data = load_fixture("sample_user.json")
    user = User(**user_data)
    assert user.name == "Test User"
```

### Pattern 3: Faker

**Generate realistic test data:**

```python
from faker import Faker

fake = Faker()

def test_with_realistic_data():
    user = User(
        name=fake.name(),
        email=fake.email(),
        address=fake.address(),
        phone=fake.phone_number()
    )
    
    assert user.name is not None
```

---

## 🚀 CONTINUOUS INTEGRATION

### GitHub Actions (Universal Template)

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # Python example
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest --cov=src --cov-report=xml
      
      # TypeScript example
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      # Upload coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
      
      # Fail if coverage below threshold
      - name: Check coverage threshold
        run: |
          coverage report --fail-under=80
```

---

## 🎓 TESTING BEST PRACTICES

### DO ✅

1. **Write tests first (TDD)** - Or immediately after code
2. **Keep tests isolated** - No shared state between tests
3. **Mock external dependencies** - APIs, databases, file systems
4. **Test one thing per test** - Single assertion preferred
5. **Use descriptive names** - Self-documenting tests
6. **Follow AAA pattern** - Arrange, Act, Assert
7. **Keep tests fast** - Unit tests <1s, integration <10s
8. **Test edge cases** - Null, empty, boundary values
9. **Test error paths** - Not just happy path
10. **Maintain tests** - Treat as production code

### DON'T ❌

1. **Skip tests** - "Will test later" = never tested
2. **Test implementation details** - Test behavior, not internals
3. **Share state** - Each test independent
4. **Ignore failing tests** - Fix immediately or delete
5. **Comment out tests** - Delete or fix
6. **Test third-party code** - Trust well-tested libraries
7. **Hard-code test data** - Use factories/fixtures
8. **Write flaky tests** - Must be deterministic
9. **Test too much in one test** - Keep focused
10. **Commit without tests** - Test first, then commit

---

## 📈 TEST METRICS TO TRACK

### Essential Metrics

```
1. Test Count:          Track growth over time
2. Code Coverage:       Minimum 80%
3. Pass Rate:           100% on main branch
4. Execution Time:      <5 min for full suite
5. Flaky Test Count:    0 (deterministic only)
6. Code Quality Score:  A grade (linter)
```

### Tracking in CI

```bash
# Generate badge for README
# https://codecov.io/gh/user/repo/badge.svg

# Track over time
echo "Date,Tests,Coverage,Duration" >> metrics.csv
echo "$(date),$(test_count),$(coverage),$(duration)" >> metrics.csv
```

---

## 🛠️ DEBUGGING FAILED TESTS

### Step-by-Step Process

1. **Read the error message carefully**
   ```
   Often the answer is in the error message
   ```

2. **Isolate the test**
   ```bash
   # Python
   pytest tests/test_file.py::test_specific_function -v
   
   # TypeScript
   npm test -- --testNamePattern="specific test"
   ```

3. **Add print statements / logging**
   ```python
   def test_debugging():
       result = function_under_test(input)
       print(f"DEBUG: result = {result}")  # Temporary debug
       assert result == expected
   ```

4. **Run with debugger**
   ```bash
   # Python
   pytest --pdb  # Drop into debugger on failure
   
   # TypeScript
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

5. **Check fixtures and mocks**
   ```
   Ensure test setup is correct
   Verify mocks return expected data
   ```

6. **Simplify the test**
   ```
   Remove complexity until it passes
   Then add back piece by piece
   ```

---

## 📚 TESTING CHEATSHEET

### Quick Reference

**Python (pytest):**
```bash
pytest                           # Run all tests
pytest -v                        # Verbose output
pytest --cov=src                 # With coverage
pytest -k "test_user"            # Run matching tests
pytest -x                        # Stop on first failure
pytest --pdb                     # Debug on failure
pytest -n auto                   # Parallel execution
```

**TypeScript (Jest):**
```bash
npm test                         # Run all tests
npm test -- --watch              # Watch mode
npm test -- --coverage           # With coverage
npm test -- --testNamePattern    # Run matching tests
npm test -- --verbose            # Verbose output
```

**Common Assertions:**

```python
# Python (pytest)
assert value == expected
assert value is not None
assert "substring" in string
assert len(list) == 5
pytest.raises(Exception)

# TypeScript (Jest)
expect(value).toBe(expected)
expect(value).not.toBeNull()
expect(string).toContain('substring')
expect(array).toHaveLength(5)
expect(() => fn()).toThrow()
```

---

## 🎯 PROJECT-SPECIFIC CHECKLIST

### For Every New Project

**Week 1:**
- [ ] Choose testing framework (pytest, jest, etc.)
- [ ] Create test directory structure
- [ ] Setup CI/CD pipeline
- [ ] Configure coverage reporting
- [ ] Write first 10 tests

**Week 2:**
- [ ] Achieve 50% coverage
- [ ] Setup pre-commit hooks
- [ ] Document testing approach
- [ ] Create fixtures/factories

**Week 3:**
- [ ] Achieve 80% coverage
- [ ] Add integration tests
- [ ] Performance baseline
- [ ] E2E critical flows

**Ongoing:**
- [ ] Test every new feature
- [ ] Maintain coverage ≥80%
- [ ] Fix flaky tests immediately
- [ ] Review test quality weekly

---

## 🔗 RESOURCES & LEARNING

### Documentation

**Python:**
- [pytest docs](https://docs.pytest.org/)
- [unittest docs](https://docs.python.org/3/library/unittest.html)
- [pytest-cov](https://pytest-cov.readthedocs.io/)

**JavaScript/TypeScript:**
- [Jest docs](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/) (Vite-native)

**General:**
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Testing Best Practices](https://testingjavascript.com/)

### Books

- "Test Driven Development" - Kent Beck
- "The Art of Unit Testing" - Roy Osherove
- "Working Effectively with Legacy Code" - Michael Feathers

---

## ✅ FINAL SUCCESS CRITERIA

**Your project is well-tested when:**

✅ **265+ tests** (or proportional to project size)  
✅ **80%+ coverage** across all modules  
✅ **100% tests passing** on main branch  
✅ **<5 min** full test suite execution  
✅ **0 flaky tests** (all deterministic)  
✅ **All critical paths** have E2E tests  
✅ **CI/CD** runs tests automatically  
✅ **Coverage** tracked over time  
✅ **Documentation** explains testing approach  
✅ **Team** follows testing standards  

---

## 🚀 QUICK START TEMPLATES

### Template 1: Python API Project

```bash
# Setup
pip install pytest pytest-cov pytest-asyncio faker

# Create structure
mkdir -p tests/{unit,integration,e2e}
touch tests/conftest.py tests/pytest.ini

# Run
pytest --cov=src --cov-report=html
```

### Template 2: TypeScript/React Project

```bash
# Setup
npm install --save-dev jest @testing-library/react
npm install --save-dev @testing-library/jest-dom

# Create structure
mkdir -p tests/{unit,integration,e2e}

# Run
npm test -- --coverage
```

### Template 3: Full-Stack Project

```bash
# Backend tests
cd backend && pytest --cov=app

# Frontend tests
cd frontend && npm test -- --coverage

# E2E tests (Playwright/Cypress)
npx playwright test
```

---

**END OF UNIVERSAL TESTING PLAYBOOK**

*Adapt these patterns to your specific project. Test everything. Test thoroughly. Ship with confidence.* ✅

---

## 📝 APPENDIX: LANGUAGE-SPECIFIC NOTES

### Go
- Use `testing` package (built-in)
- Table-driven tests preferred
- `go test -cover` for coverage

### Rust
- Use `cargo test`
- Doc tests encouraged
- `cargo tarpaulin` for coverage

### Ruby
- RSpec or Minitest
- Factory Bot for fixtures
- SimpleCov for coverage

### PHP
- PHPUnit standard
- Pest (modern alternative)
- PHPStan for static analysis

### Swift
- XCTest framework
- Quick/Nimble (BDD style)
- XCUITest for UI

**Principles remain the same across languages. Tools differ, philosophy doesn't.**
