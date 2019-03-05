<template>
	<div class="Show">
		<span @click="store.rename()">Name: {{store.firstName}} {{store.lastName}}</span>
		<br/>
		<span @click="store.shotRemotely()">
			Shot
		</span>
		<br/>
		<a @click="store.addGun()">Add gun</a>
		<template v-for="gun in store.guns">
			<br/>
			<br/>
			<div>{{gun.name}}({{gun.ammo}}) hits: {{gun.hits}}</div>
			<a @click="gun.shot()">Shot</a>
			<br/>
			<a @click="gun.longShot()">Long shot</a>
		</template>
	</div>
</template>
<script lang="ts">
	import {createStateManager, State, Store, Type} from '..';

	@Store()
	class Gun extends State {
		name = 'glock';
		ammo = 7;
		hits = 0;

		fire() {
			this.ammo--;
		}

		shot() {
			this.fire();
			this.hits++;
		}

		longShot() {
			this.ammo--;
			setTimeout(() => {
				this.hits++;
			}, 100);
		}
	}

	@Store()
	class StateManager extends State {
		firstName = 'James';
		lastName = 'Bond';

		addGun() {
			this.guns.push(new Gun());
		}

		shotRemotely() {
			this.addGun();
			this.guns[0].fire();
		}

		@Type(Date)
		birthday = new Date();

		@Type(Gun)
		guns: Gun[] = [
			new Gun()
		];
	}

	const store = createStateManager(StateManager);

	export default {
		name: 'Show',
		data() {
			return {
				store
			};
		}
	};
</script>