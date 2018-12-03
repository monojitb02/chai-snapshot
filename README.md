# chai-snapshot

Hook for chai to generate and matche snapshot in testing node application just like in jest

## Getting Started

Install chai-snapshot using [`npm`](https://www.npmjs.com/):

```bash
npm install --save-dev chai-snapshot
```

Example Useage
```javascript
// first.spec.js  => The first file test-runner executes or add these below lines at the top of every spec file
const chai = require('chai');
const chaiSnapshot = require('chai-snapshot');
const { expect } = chai;
chai.use(chaiSnapshot);


//component.spec.js
describe("GET /hello", () =>{
    it("Should say Hello to Starnger", () => {
        return request(app)
        .get('/hello')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
            expect(body).to.matchSnapshot(this);
        });
    });

    it("Should say Hello to Jhon", () => {
        return request(app)
        .get('/hello')
        .query({ name: 'Jhon' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(({ body }) => {
            expect(body).to.matchSnapshot(this);
        });
    });
});
```
It will automatically create `__snapshots__` folder in same folder of specs and snapshot file like below
```json
{
  "GET /hello > Should say Hello to Starnger > #1": "Hello, Stranger!",
  "GET /hello > Should say Hello to Jhon > #1": {
    "name": "Jhon",
    "say": "Hello"
  }
}
```
You can set `CHAI_SNAPSHOT_PRETTY = true` to get prettified Snapshots like this.
```json
{
  "GET /hello": {
    "Should say Hello to Starnger": {
      "#1": "Hello, Stranger!",
    },
    "Should say Hello to Jhon": {
      "#1": {
        "name": "Jhon",
        "say": "Hello"
      }
    }
  }
}
```

If the found snapshot does not match with the actuals and you want to update the related snapshots, use `isForced` in `expect` chain.

Example Useage
```javascript
// first.spec.js  => The first file testrunner executes or add these below lines at the top of every spec file
const chaiSnapshot =require('chai-snapshot');

chai.use(chaiSnapshot);


//component.spec.js
it("Should say Hello", () => {
    return request(app)
      .get('/hello')
      .query({ name: 'Jack' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(({ body }) => {
        expect(body).isForced.to.matchSnapshot(this);
      });
});
```

Or

Set `CHAI_SNAPSHOT_UPDATE = true` to update the snapshots if there is any mismatch in any of the spec files even if `isForced` is not used.


Note: It is tested in `mocha v5.2.0` and `chai v4.2.0`.