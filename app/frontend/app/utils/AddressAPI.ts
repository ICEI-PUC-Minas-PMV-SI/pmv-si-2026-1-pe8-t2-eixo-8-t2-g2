import type { Address, AddressAPIResponse } from '~/@types/address';
import Request from './Request';

type AddressByLocationResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

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

  async searchPostalCode(params: { state: string; city: string; street: string }) {
    const { state, city, street } = params;

    const response = await Request.get<AddressByLocationResponse[]>(
      `https://viacep.com.br/ws/${state}/${city}/${street}/json/`,
    );

    return response.map((item) => ({
      postalCode: item.cep,
      street: item.logradouro,
      complement: item.complemento,
      neighborhood: item.bairro,
      city: item.localidade,
      stateAbbreviation: item.uf,
    }));
  }
}

export default new AddressAPI();
