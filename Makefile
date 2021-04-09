.PHONY: ci doc fmt fmt-check lint test

ci:
	@make fmt-check
	@make test

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt

fmt-check:
	@deno fmt --check

lint:
	@deno lint --unstable

test:
	@deno test --allow-read --unstable
