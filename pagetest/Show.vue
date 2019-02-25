<template>
	<div class="Show" @click="store.rename()">
		Name: {{store.firstName}} {{store.lastName}}
		<br/>
		<span v-for="gun in store.guns" @click="gun.fire()">{{gun.name}}({{gun.ammo}})</span>
	</div>
</template>
<script lang="ts">
	import {createStateManager, State, Store, Type} from '..';

	@Store()
	class Gun extends State {
		name = 'glock';
		ammo = 7;

		fire() {
			this.ammo--;
		}
	}

	@Store()
	class StateManager extends State {
		firstName = 'James';
		lastName = 'Bond';

		rename() {
			this.firstName += 'a';
		}

		@Type(Date)
		birthday = new Date();

		@Type(Gun)
		guns: Gun[] = [new Gun()];
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