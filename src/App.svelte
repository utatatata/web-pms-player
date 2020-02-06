<script>
	import Router from 'svelte-spa-router'
	import Home from './routes/Home.svelte'
	import Importer from './routes/Importer.svelte'

	const routes = {
		'/': Home,
		'/importer': Importer,
	}
</script>

<Router {routes}/>
