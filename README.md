# vue-state-proxy
Simple state manager based on and for Vue.
### Installation
```
npm install vue-state-proxy
```

* compatible with Vue-devtools
* uses Proxy only in development mode
* allow to store class instances (with parsing even from JSON)
* no boring actions and reducers
* typing support

### Usage

Creating state manager
```ts
import {Store, Type} from 'vue-state-proxy';
@Store()
class Gun {
    name = 'glock';
    ammo = 7;

    fire() {
        this.ammo--;
    }
}

@Store()
class StateManager {
    firstName = 'James';
    lastName = 'Bond';

    @Type(Date)
    birthday = new Date();

    @Type(Gun)
    guns: Gun[] = [new Gun()];
}

export const Store = createStateManager(StateManager);
```
Usage in other file
```vue
import {Store} from './store.ts'
new Vue({
    template: `
        <div>
            Name: {{store.firstName}} {{store.lastName}}
       		<br/>
       		<span v-for="gun in store.guns" @click="gun.fire()">
       		    {{gun.name}}({{gun.ammo}})
       		</span>
        </div>
    `,
    data() {
        return {
            store: Store
        };
    }
})
```

#### @Store()

Decorates given class with setState and getState methods,
in devMode also wrap methods to support devtools.

##### .setState(data)
Overwrite current state with data

##### .getState()
Return data snap from state

#### @Type
Required by parser to create proper class instances from raw state (JSON format)

IMPORTANT!!!
Remember about providing props type for arrays, it is also needed by parser

#### createStateManager(storeConstructor)
Creates object usable by Vue (with Vue.observable)

IMPORTANT!!!
Class methods are not bound to instance like in Vue class, so use in templates only with brackets

#### Dev-tools

Logs are created with patter:
```
{ClassName}.{propName}
```
or for methods:
```
{ClassName}.{methodName}(#{callNumber})
```
'callNumber' can be helpful to detect async changes inside methods