import type { Address, AddressAPIResponse } from '~/@types/address';
import Request from './Request';

class AddressAPI {
  async getAddressByPostalCode(postalCode: string): Promise<Address> {
    const response = await Request.get<AddressAPIResponse>(
      `https://viacep.com.br/ws/${postalCode}/json/`,
    );
    const {
      logradouro: street,
      complemento: complement,
      bairro: neighborhood,
      localidade: city,
      uf: stateAbbreviation,
      estado: state,
    } = response;
    return {
      postalCode,
      street,
      complement,
      neighborhood,
      city,
      state,
      stateAbbreviation,
    };
  }
}

export default new AddressAPI();
