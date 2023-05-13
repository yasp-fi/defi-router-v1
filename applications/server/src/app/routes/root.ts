import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JsonRpcServer } from "@yasp/utils";

const jsonRpcServer = new JsonRpcServer();


// Pricing
jsonRpcServer.registerProcedure('getAllPriceFeeds', async () => {})

// Infra
jsonRpcServer.registerProcedure('doHealthCheck', async () => {})

// Info / Data
jsonRpcServer.registerProcedure('getAllPools', async () => {})
jsonRpcServer.registerProcedure('getAllProtocols', async () => {})

// Approve
jsonRpcServer.registerProcedure('getRouterApproveAddress', async () => {})
jsonRpcServer.registerProcedure('getRouterApprovePayload', async () => {})
jsonRpcServer.registerProcedure('getRouterCurrentSpendAllowance', async () => {})

// DeFi Invest
jsonRpcServer.registerProcedure('getDeFiTransactionPayload', async () => {})



export default async function (fastify: FastifyInstance) {
  fastify.post(
    '/jsonRpc',
    async function (request: FastifyRequest, reply: FastifyReply) {
      return jsonRpcServer.handleFastifyIncomingRequest(request, reply);
    }
  );
}
