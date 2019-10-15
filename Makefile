test:
	npx eslint --color --quiet *.js
	node --pending-deprecation --trace-deprecation --throw-deprecation --trace-warnings test.js

publish:
	git push -u --tags origin master
	npm publish

deps:
	rm -rf node_modules
	npm i

update:
	npx updates -cu
	$(MAKE) deps

patch:
	$(MAKE) test
	npx ver -C patch
	$(MAKE) publish

minor:
	$(MAKE) test
	npx ver -C minor
	$(MAKE) publish

major:
	$(MAKE) test
	npx ver -C major
	$(MAKE) publish

.PHONY: test publish deps update patch minor major
