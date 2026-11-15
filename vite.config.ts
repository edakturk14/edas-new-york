import {defineConfig,loadEnv} from 'vite';
import {makeCreatorHandler} from './server/creator-handler';
import {memoryCreatorStore} from './scripts/fixtures/creator-store';
export default defineConfig(({mode})=>{
  const env={...process.env,...loadEnv(mode,process.cwd(),'')};
  // Only the local development server can use the explicit QA fixture.
  const qa=env.CREATOR_LOCAL_QA==='true'&&!process.env.VERCEL;
  const store=qa?memoryCreatorStore():undefined;
  const serverEnv=qa?{...env,UPSTASH_REDIS_REST_URL:'https://fixture.invalid',UPSTASH_REDIS_REST_TOKEN:'local-fixture',CREATOR_ADMIN_TOKEN:'qa-only-access-key-for-local-tests',CREATOR_ANALYTICS_ENABLED:'true'}:env;
  return {plugins:[{name:'creator-api-local',configureServer(server){
    for(const [path,kind] of [['creator-interest','interest'],['creator-admin','admin'],['guide-event','events']] as const){
      const handler=makeCreatorHandler(kind,serverEnv,store);
      server.middlewares.use('/api/'+path,(req,res)=>{void handler(req,res)});
    }
  }}]};
});
