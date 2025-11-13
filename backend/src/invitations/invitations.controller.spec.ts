import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let validateMock: jest.Mock;

  beforeEach(() => {
    validateMock = jest.fn();
    controller = new InvitationsController({
      validateToken: validateMock,
    } as unknown as InvitationsService);
  });

  it('should forward token validation', async () => {
    validateMock.mockResolvedValue({ valid: true });

    const result = await controller.validateToken('token');

    expect(validateMock).toHaveBeenCalledWith('token');
    expect(result).toEqual({ valid: true });
  });
});
