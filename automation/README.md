# 🤖 APEX Automation Toolkit
**Version**: 1.0.0 | **Last Updated**: 2025-01-02  
**Purpose**: Full automation dla budowy aplikacji Shopify z Claude Code

---

## 🎯 OVERVIEW

Ten folder zawiera **wszystko czego potrzebujesz** do full-automated budowy aplikacji Shopify:

```
USER → Claude Code → MCP Servers → Auto: Build + Test + Deploy → Production App
```

**Czas realizacji:** 2-4 tygodnie → **2-4 dni**  
**Automatyzacja:** 95% (5% = initial setup)

---

## 📋 QUICK START (3 kroki)

### Krok 1: Setup MCP Servers (ONCE, first time only)

```bash
# Skopiuj ten prompt do Claude Code:

Execute automation setup:
1. Read file: /mnt/project/automation/mcp/setup-mcp.sh
2. Run the script to install all MCP servers
3. Read file: /mnt/project/automation/mcp/config.template.json
4. Create ~/.config/claude/config.json with MCP configuration
5. Verify all servers connected: claude mcp list
6. Report status

Expected: 4 MCP servers active (shopify-dev, playwright, github, shopify-admin)
```

**Czas:** 5 minut  
**Wynik:** MCP servers gotowe do użycia

---

### Krok 2: Start Nowej Aplikacji

```bash
# Skopiuj ten prompt do Claude Code:

Initialize new app: [APP_NAME]

Read initialization prompt:
/mnt/project/automation/claude-code/01-init-new-app.md

Execute with parameters:
- App name: [APP_NAME]
- App slug: [app-0X-slug]
- Business concept: [BRIEF_DESCRIPTION]

Expected output:
- Scaffolded app structure
- DATABASE ready
- OAuth working
- PROJECT_BRIEF.md created
- Git initialized
```

**Czas:** 10-15 minut  
**Wynik:** Working skeleton app

---

### Krok 3: Build → Test → Deploy (Automated)

```bash
# Claude Code automatycznie wykonuje:

Phase 2: Core Development (3-5 dni)
- Read: /mnt/project/automation/claude-code/02-core-development.md
- Execute full development workflow

Phase 3: Integration & Testing (1-2 dni)
- Read: /mnt/project/automation/claude-code/03-integration-testing.md
- Run Playwright MCP tests

Phase 4: Deployment (0.5 dnia)
- Read: /mnt/project/automation/claude-code/04-deployment.md
- Deploy to Railway + Shopify App Store

Phase 5: Monitoring (ongoing)
- Read: /mnt/project/automation/claude-code/05-monitoring.md
- Setup continuous monitoring
```

**Czas:** 4-7 dni total  
**Wynik:** Production-ready app in Shopify App Store

---

## 🗂️ FOLDER STRUCTURE EXPLAINED

### `/mcp/` - MCP Server Configurations
- **config.template.json** - Template dla Claude Desktop config
- **setup-mcp.sh** - Installation script dla wszystkich MCP servers
- **Individual configs** - Per-server settings

### `/claude-code/` - Workflow Prompts
Kompletne prompty dla każdej fazy:
1. **01-init-new-app.md** - Scaffolding + setup
2. **02-core-development.md** - Build features
3. **03-integration-testing.md** - E2E testing
4. **04-deployment.md** - Production deploy
5. **05-monitoring.md** - Continuous monitoring

### `/testing/` - Testing Framework
- **playwright-config.ts** - Playwright MCP configuration
- **test-templates/** - Pre-built test scenarios
- **e2e-workflow.md** - Complete E2E testing guide

### `/deployment/` - Deployment Tools
- **railway-graphql-queries.md** - Railway API operations
- **github-actions-template.yml** - CI/CD pipeline
- **deployment-checklist.md** - Pre-deploy verification

### `/templates/` - Reusable Templates
- **PROJECT_BRIEF_TEMPLATE.md** - App specification
- **IMPLEMENTATION_LOG_TEMPLATE.md** - Progress tracking
- **env.template** - Environment variables

---

## 🔧 DEPENDENCIES (Auto-installed by setup script)

### Global Tools
```bash
@shopify/cli           # Shopify development
@playwright/mcp        # E2E testing
@modelcontextprotocol/server-github  # Git automation
@akson/mcp-shopify     # Shopify admin
@railway/cli           # Deployment
```

### Per-App Dependencies (Auto-installed during init)
```bash
@shopify/shopify-app-remix  # Framework
prisma                 # Database ORM
bull                   # Job queue
resend                 # Emails
@sentry/remix          # Error tracking
```

---

## 📊 AUTOMATION LEVELS BY PHASE

| Phase | Manual | Automated | Time Saved |
|-------|--------|-----------|------------|
| Setup | 5% | 95% | 4h → 10m |
| Development | 10% | 90% | 80h → 8h |
| Testing | 5% | 95% | 20h → 1h |
| Deployment | 5% | 95% | 8h → 30m |
| Monitoring | 0% | 100% | Ongoing |

**Total time reduction:** 85-90%

---

## 🎯 WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│ USER: "Build app for [PROBLEM]"                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE: Read automation/claude-code/01-init-new-app.md│
│ - Use Shopify Dev MCP: learn_shopify_api                   │
│ - Scaffold: shopify app init                               │
│ - Setup: Railway + PostgreSQL + Redis                      │
│ - Generate: PROJECT_BRIEF.md                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE: Read 02-core-development.md                   │
│ - Build: API endpoints, UI components                      │
│ - Test: Vitest unit tests                                  │
│ - Document: IMPLEMENTATION_LOG.md                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE: Read 03-integration-testing.md                │
│ - Use Playwright MCP: Run E2E tests                        │
│ - Fix: Any bugs found                                      │
│ - Verify: All CP tests passing                             │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ CLAUDE CODE: Read 04-deployment.md                         │
│ - Deploy: Railway GraphQL API                              │
│ - Submit: Shopify App Store                                │
│ - Monitor: Sentry + Railway logs                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION APP: Live & Monitored                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 TROUBLESHOOTING

### MCP Servers Not Connected
```bash
# Verify installation
npx @shopify/dev-mcp@latest --version
npx @playwright/mcp@latest --version

# Check Claude config
cat ~/.config/claude/config.json

# Restart Claude Desktop/Code
```

### Claude Code Can't Find Prompts
```bash
# Ensure you're in project root
cd ~/projects/apex-ecommerce-portfolio

# Verify files exist
ls -la automation/claude-code/
```

### Railway Deployment Fails
```bash
# Check Railway CLI login
railway whoami

# Verify environment variables
railway variables

# Check logs
railway logs
```

### Playwright Tests Fail
```bash
# Run in headed mode for debugging
# Update automation/testing/playwright-config.ts:
# Remove --headless flag
```

---

## 📚 ADDITIONAL RESOURCES

### Documents to Read (in order)
1. `/mnt/project/APEX_FRAMEWORK.md` - Portfolio strategy
2. `/mnt/project/APEX_PROJECT_STATUS.md` - Current state
3. `/mnt/project/CLAUDE.md` - Session initialization
4. This README - Automation workflow

### External Links
- [Shopify Dev Docs](https://shopify.dev/docs/apps)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Railway Docs](https://docs.railway.app)
- [Claude MCP Guide](https://docs.anthropic.com/claude/docs/model-context-protocol)

---

## 🎓 LEARNING PATH

### First App (ConversionAI)
- Learn the workflow
- Understand MCP integration
- Experience full automation
- Document lessons learned

### Second App (PriceRounder)
- Reuse 60-70% code
- 50% faster build time
- Refine automation
- Extract shared packages

### Third+ Apps
- Standardized workflow
- Minimal manual intervention
- Portfolio synergies
- Cross-promotion integration

---

## 📝 MAINTENANCE

### Weekly
- [ ] Update MCP servers: `npm update -g @shopify/dev-mcp @playwright/mcp`
- [ ] Review automation efficiency metrics
- [ ] Update prompts based on learnings

### Monthly
- [ ] Review APEX_FRAMEWORK.md for updates
- [ ] Optimize shared packages
- [ ] Update dependencies
- [ ] Backup automation configs

### After Each App Launch
- [ ] Document lessons in IMPLEMENTATION_LOG.md
- [ ] Update automation prompts if needed
- [ ] Share improvements across portfolio
- [ ] Update this README with new patterns

---

## 🎯 SUCCESS METRICS

Track these for each app:

| Metric | Target | Current |
|--------|--------|---------|
| Setup time | <15 min | - |
| Build time | <7 days | - |
| Test coverage | >70% | - |
| E2E tests passing | 100% | - |
| Deploy time | <30 min | - |
| First bug (prod) | >7 days | - |

---

## 💡 PRO TIPS

1. **Always start with MCP setup** - Don't skip this step
2. **Read prompts before execution** - Understand what Claude Code will do
3. **Update IMPLEMENTATION_LOG.md** - Claude Code does this automatically
4. **Trust the automation** - It's been tested on ConversionAI
5. **Document deviations** - If you change workflow, update prompts
6. **Use Playwright MCP liberally** - E2E tests catch 80% of bugs
7. **Monitor Sentry from day 1** - Early error detection saves time

---

## 🚀 NEXT STEPS

### For New Users:
```bash
1. Run: automation/mcp/setup-mcp.sh (via Claude Code)
2. Verify: claude mcp list (4 servers)
3. Start: automation/claude-code/01-init-new-app.md
```

### For Returning Users:
```bash
1. Start new app: automation/claude-code/01-init-new-app.md
2. Continue existing: automation/claude-code/02-core-development.md
3. Deploy: automation/claude-code/04-deployment.md
```

### For Debugging:
```bash
1. Check: IMPLEMENTATION_LOG.md in app folder
2. Review: Sentry dashboard
3. Run: Playwright MCP tests manually
4. Verify: Railway logs
```

---

**Version History:**
- v1.0.0 (2025-01-02): Initial release

**Maintained by:** APEX Team  
**Questions?** Update IMPLEMENTATION_LOG.md and ask Claude Code

**Ready to automate! 🚀**
