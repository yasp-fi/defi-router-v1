import { FastifyRequest, FastifyReply } from "fastify";
import { z } from 'zod';

type Procedure = (params: Record<string, unknown>) => Promise<any>;


const jsonRPCRequestBodySchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.string(),
  method: z.string(),
  params: z.record(z.any()),
});

export type JsonRpcRequestBody = z.infer<typeof jsonRPCRequestBodySchema>;

export class JsonRpcServer {
  private procedures: Map<string, Procedure> = new Map<string, Procedure>();

  public registerProcedure(name: string, procedure: Procedure): void {
    this.procedures.set(name, procedure);
  }

  async handleFastifyIncomingRequest(req: FastifyRequest, res: FastifyReply): Promise<void> {
    const { id, jsonrpc, method, params } = await jsonRPCRequestBodySchema.parseAsync(req.body);

    if (jsonrpc !== '2.0') {
      res.status(400).send({ jsonrpc, id, error: { code: -32600, message: 'Invalid Request' } });
      return;
    }

    const procedure = this.procedures.get(method);

    if (!procedure) {
      res.status(400).send({ jsonrpc, id, error: { code: -32601, message: 'Method not found' } });
      return;
    }

    try {
      const result = await procedure(params);
      res.send({ jsonrpc, id, result });
    } catch (error) {
      res.status(500).send({ jsonrpc, id, error: { code: -32000, message: 'Server error' } });
    }
  }
}
