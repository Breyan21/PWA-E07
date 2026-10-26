.PHONY: verify test build

# Verificación global: lint, tipos, build, unit+integración con cobertura,
# pruebas históricas, E2E (Playwright) y reporte técnico. Falla si cualquier etapa falla.
verify:
	npm run verify:all

test:
	npm test

build:
	npm run build
