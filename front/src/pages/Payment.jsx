import React, { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  isValidCardExpirationDate,
  isValidCardNumber,
  isValidCvv,
  isValidName,
} from '../utils';
import { config } from '../config';
import { Layout } from './__Layout';

const { paths, textsDefault } = config;

export const Payment = () => {
  const [componentIsReady, setComponentIsReady] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [texts, setTexts] = useState(textsDefault);

  const location = useLocation();
  const navigate = useNavigate();

  const { signature, paymentMethods, selectedLoanNumber, course } =
    location.state ?? {};

  const initialErrorsState = Object.freeze({
    cardNumber: false,
    cardName: false,
    expirationDate: false,
    cvv: false,
  });

  const [errors, setErros] = useState(initialErrorsState);

  useEffect(() => {
    if (
      !paymentMethods ||
      !paymentMethods.length ||
      !signature ||
      !course ||
      !selectedLoanNumber
    ) {
      navigate(paths.home);
      return;
    }

    setTexts((state) => ({
      ...state,
      title: 'Método de pagamento',
    }));
    setComponentIsReady(true);
    setFetching(false);
  }, []); // eslint-disable-line

  function handleFormValidation(e) {
    if (!e.currentTarget) {
      console.error('Erro no formulário');
      console.error(e);
      return false;
    }

    const {
      elements: {
        method: { value: method },
        cardNumber: { value: cardNumber },
        cardName: { value: cardName },
        expirationDate: { value: expirationDate },
        cvv: { value: cvv },
      },
    } = e.currentTarget;

    console.log(method);

    const currentErrors = {};

    if (!isValidCardNumber(cardNumber)) currentErrors.cardNumber = true;
    if (!isValidName(cardName)) currentErrors.cardName = true;
    if (!isValidCardExpirationDate(expirationDate))
      currentErrors.expirationDate = true;
    if (!isValidCvv(cvv)) currentErrors.cvv = true;

    if (Object.keys(currentErrors).length) {
      setErros((state) => ({ ...state, ...currentErrors }));
      return false;
    }

    return true;
  }

  function handleSubmit(e) {
    setFetching(true);
    e.preventDefault();
    setErros(initialErrorsState);
    if (handleFormValidation(e)) {
      const {
        elements: {
          method: { value: method },
          cardNumber: { value: cardNumber },
          cardName: { value: cardName },
          expirationDate: { value: expirationDate },
          cvv: { value: cvv },
        },
      } = e.currentTarget;

      return navigate(paths.step4, {
        state: {
          signature,
          selectedLoanNumber,
          course,
          payment: {
            method,
            cardNumber,
            cardName,
            expirationDate,
            cvv,
          },
        },
      });
    }
    setFetching(false);
  }

  if (!componentIsReady) return <h1>Aguarde</h1>;

  return (
    <Layout title={texts.title} subtitle={texts.subtitle}>
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="mx-auto -mt-4 mb-4 flex h-7 items-stretch overflow-hidden rounded-full bg-gray-50 text-gray-500 shadow lg:-mt-6 lg:mb-6">
          {paymentMethods.map(({ method }, i) => (
            <div key={method} className="flex">
              <input
                id={method}
                type="radio"
                name="method"
                value={method}
                className="peer hidden"
                defaultChecked={i === 0}
              />
              <label
                className="flex select-none items-center px-4 text-xs font-bold transition-colors duration-300 peer-checked:bg-gray-800 peer-checked:text-gray-200"
                htmlFor={method}
              >
                {method.split('_')[0].toUpperCase()}
              </label>
            </div>
          ))}
        </div>

        <div className="mx-auto overflow-hidden rounded-lg shadow-lg lg:flex lg:max-w-fit">
          <div className="space-y-4 bg-white px-6 py-8 lg:space-y-6 lg:p-12">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Payment
            </h2>

            <label className="flex flex-col">
              <span className="mb-1 text-gray-500">
                Número do cartão
                {errors.cardNumber && (
                  <em className="text-error ml-1 text-xs font-bold not-italic">
                    (inválido)
                  </em>
                )}
              </span>
              <IMaskInput
                mask={'0000 0000 0000 0000'}
                required
                className="input input-primary"
                name="cardNumber"
                placeholder="Digite o número do cartão"
                disabled={fetching}
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1 text-gray-500">
                Nome escrito no cartão
                {errors.cardName && (
                  <em className="text-error ml-1 text-xs font-bold not-italic">
                    (inválido)
                  </em>
                )}
              </span>
              <input
                required
                className="input input-primary"
                type="text"
                name="cardName"
                placeholder="Qual o nome escrito no cartão?"
                disabled={fetching}
              />
            </label>

            <div className="flex space-x-4">
              <label className="flex grow flex-col">
                <span className="mb-1 text-gray-500">
                  Validade
                  {errors.expirationDate && (
                    <em className="text-error ml-1 text-xs font-bold not-italic">
                      (inválido)
                    </em>
                  )}
                </span>
                <IMaskInput
                  mask={'00/00'}
                  required
                  className="input input-primary w-[4.5rem]"
                  name="expirationDate"
                  placeholder="00/00"
                  disabled={fetching}
                />
              </label>
              <label className="flex grow flex-col">
                <span className="mb-1 text-gray-500">
                  CVV
                  {errors.cvv && (
                    <em className="text-error ml-1 text-xs font-bold not-italic">
                      (inválido)
                    </em>
                  )}
                </span>
                <IMaskInput
                  mask={'000'}
                  required
                  className="input input-primary w-[4.5rem]"
                  name="cvv"
                  placeholder="CVV"
                  disabled={fetching}
                />
              </label>
            </div>

            <div className="flex justify-between space-x-4 sm:w-[18.75rem] sm:space-x-0">
              <Link to={paths.home} className="btn btn-ghost">
                Cancelar
              </Link>
              <button className="btn" type="submit">
                Próximo passo
              </button>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
};
