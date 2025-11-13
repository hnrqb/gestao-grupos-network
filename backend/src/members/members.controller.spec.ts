import type { CreateMemberDto } from './dto/create-member.dto';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  const createMock = jest.fn();
  const findAllMock = jest.fn();
  const findOneMock = jest.fn();
  const directoryMock = jest.fn();

  beforeEach(() => {
    createMock.mockReset();
    findAllMock.mockReset();
    findOneMock.mockReset();
    directoryMock.mockReset();

    controller = new MembersController({
      create: createMock,
      findAll: findAllMock,
      findOne: findOneMock,
      getDirectory: directoryMock,
    } as unknown as MembersService);
  });

  it('should delegate creation', async () => {
    createMock.mockResolvedValue('created');
    const payload: CreateMemberDto = { token: 'token' };

    await expect(controller.create(payload)).resolves.toEqual('created');
  });

  it('should forward admin-protected findAll', async () => {
    findAllMock.mockResolvedValue(['member']);
    await controller.findAll();
    expect(findAllMock).toHaveBeenCalled();
  });

  it('should return directory without guard', async () => {
    directoryMock.mockResolvedValue(['dir']);
    await controller.getDirectory();
    expect(directoryMock).toHaveBeenCalled();
  });

  it('should get member by id', async () => {
    findOneMock.mockResolvedValue({ id: '1' });
    await controller.findOne('1');
    expect(findOneMock).toHaveBeenCalledWith('1');
  });
});
