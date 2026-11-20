import { describe, expect, it } from 'vitest';
import type {
  AlgorithmResult,
  CipherAlgorithm,
  ExecutionStep,
  OperationMode,
  ValidationResult,
} from '@/types';

interface IdentityParams {
  dummyKey?: number;
}

interface IdentityStepData {
  charCode: number;
}

/**
 * Implémentation factice de test (identité) respectant le contrat CipherAlgorithm.
 */
class IdentityCipher implements CipherAlgorithm<IdentityParams, IdentityStepData> {
  readonly id = 'caesar' as const;

  validate(params: IdentityParams): ValidationResult {
    if (params.dummyKey !== undefined && params.dummyKey < 0) {
      return {
        valid: false,
        errors: [
          {
            key: 'errors.negativeKey',
            params: { value: params.dummyKey },
          },
        ],
      };
    }
    return { valid: true };
  }

  encrypt(text: string, _params: IdentityParams): string {
    return text;
  }

  decrypt(text: string, _params: IdentityParams): string {
    return text;
  }

  getSteps(
    text: string,
    params: IdentityParams,
    mode: OperationMode,
  ): AlgorithmResult<IdentityStepData> {
    const output = mode === 'encrypt' ? this.encrypt(text, params) : this.decrypt(text, params);

    const steps: ExecutionStep<IdentityStepData>[] = Array.from(text).map((char, index) => ({
      index,
      input: char,
      key: params.dummyKey,
      calculation: `${char} -> ${char}`,
      output: char,
      explanation: {
        key: 'steps.identityExplanation',
        params: { char, index },
      },
      data: {
        charCode: char.charCodeAt(0),
      },
    }));

    return {
      input: text,
      output,
      steps,
    };
  }
}

describe('CipherAlgorithm contract and engine types', () => {
  const cipher = new IdentityCipher();
  const params: IdentityParams = { dummyKey: 42 };

  it('respecte la propriété de réversibilité : decrypt(encrypt(x)) === x', () => {
    const plainText = 'HELLO CRYPTOLAB';
    const encrypted = cipher.encrypt(plainText, params);
    const decrypted = cipher.decrypt(encrypted, params);

    expect(decrypted).toBe(plainText);
  });

  it('fournit des étapes avec un output identique à encrypt / decrypt', () => {
    const plainText = 'SECRET';
    const encryptResult = cipher.getSteps(plainText, params, 'encrypt');

    expect(encryptResult.output).toBe(cipher.encrypt(plainText, params));
    expect(encryptResult.input).toBe(plainText);
    expect(encryptResult.steps).toHaveLength(plainText.length);
    expect(encryptResult.steps[0]).toEqual({
      index: 0,
      input: 'S',
      key: 42,
      calculation: 'S -> S',
      output: 'S',
      explanation: {
        key: 'steps.identityExplanation',
        params: { char: 'S', index: 0 },
      },
      data: {
        charCode: 83,
      },
    });

    const decryptResult = cipher.getSteps(plainText, params, 'decrypt');
    expect(decryptResult.output).toBe(cipher.decrypt(plainText, params));
  });

  it('gère les résultats de validation discriminés', () => {
    const validCheck = cipher.validate({ dummyKey: 10 });
    expect(validCheck.valid).toBe(true);

    const invalidCheck = cipher.validate({ dummyKey: -5 });
    expect(invalidCheck.valid).toBe(false);
    if (!invalidCheck.valid) {
      expect(invalidCheck.errors).toHaveLength(1);
      expect(invalidCheck.errors[0]?.key).toBe('errors.negativeKey');
      expect(invalidCheck.errors[0]?.params).toEqual({ value: -5 });
    }
  });
});
