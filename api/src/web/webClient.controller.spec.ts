import { Response } from 'express';
import { WebClientController } from './webClient.controller';

describe('WebClientController', () => {
  const controller = new WebClientController();

  const fakeResponse = () => {
    const res = { sendFile: jest.fn(), status: jest.fn(), end: jest.fn() };
    res.status.mockReturnValue(res);
    return res as unknown as Response & { sendFile: jest.Mock; status: jest.Mock; end: jest.Mock };
  };

  it('answers with the built client entry point', () => {
    const res = fakeResponse();

    controller.index(res);

    expect(res.sendFile.mock.calls[0][0]).toMatch(/index\.html$/);
  });

  it('answers not found instead of failing when the client was never built', () => {
    const res = fakeResponse();

    controller.index(res);
    const [, onError] = res.sendFile.mock.calls[0];
    onError(new Error('ENOENT'));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalled();
  });
});
