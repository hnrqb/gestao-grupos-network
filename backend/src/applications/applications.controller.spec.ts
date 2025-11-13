import { BadRequestException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let findAllMock: jest.Mock;

  beforeEach(() => {
    findAllMock = jest.fn();
    controller = new ApplicationsController({
      create: jest.fn(),
      findAll: findAllMock,
      findOne: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
    } as unknown as ApplicationsService);
  });

  it('should pass undefined when status is not provided', async () => {
    await controller.findAll(undefined);
    expect(findAllMock).toHaveBeenCalledWith(undefined);
  });

  it('should normalize status value', async () => {
    await controller.findAll('approved');
    expect(findAllMock).toHaveBeenCalledWith(ApplicationStatus.APPROVED);
  });

  it('should throw BadRequestException for invalid status', () => {
    expect(() => controller.findAll('invalid')).toThrow(BadRequestException);
    expect(findAllMock).not.toHaveBeenCalled();
  });
});
