import { describe, expect, it } from 'vitest';
import {
  buildAlphabetFromKeyword,
  caesarAlgorithm,
  getPaddingLength,
  permutationAlgorithm,
  substitutionAlgorithm,
  vigenereAlgorithm,
} from '@/algorithms';

describe('Cas de référence issus du TD', () => {
  describe('Chiffre de César', () => {
    it('chiffre "BONJOUR" avec décalage 3 => "ERQMRXU" et inverse', () => {
      const cipher = caesarAlgorithm.encrypt('BONJOUR', { shift: 3 });
      expect(cipher).toBe('ERQMRXU');
      expect(caesarAlgorithm.decrypt(cipher, { shift: 3 })).toBe('BONJOUR');
    });

    it('chiffre "EXAMEN" avec décalage 7 => "LEHTLU" et inverse', () => {
      const cipher = caesarAlgorithm.encrypt('EXAMEN', { shift: 7 });
      expect(cipher).toBe('LEHTLU');
      expect(caesarAlgorithm.decrypt(cipher, { shift: 7 })).toBe('EXAMEN');
    });
  });

  describe('Chiffre par substitution monoalphabétique', () => {
    it('chiffre "CRYPTOGRAPHIE" avec le mot-clé "SECURITE" => "CNYLPKTNSLABR" et inverse', () => {
      const alphabet = buildAlphabetFromKeyword('SECURITE');
      const cipher = substitutionAlgorithm.encrypt('CRYPTOGRAPHIE', { alphabet });
      expect(cipher).toBe('CNYLPKTNSLABR');
      expect(substitutionAlgorithm.decrypt(cipher, { alphabet })).toBe('CRYPTOGRAPHIE');
    });

    it('chiffre "SECURITE" avec le mot-clé "CRYPTOGRAPHIE" et inverse', () => {
      const alphabet = buildAlphabetFromKeyword('CRYPTOGRAPHIE');
      const cipher = substitutionAlgorithm.encrypt('SECURITE', { alphabet });
      expect(cipher).toBe('NTYSMHQT');
      expect(substitutionAlgorithm.decrypt(cipher, { alphabet })).toBe('SECURITE');
    });
  });

  describe('Chiffre par permutation de blocs', () => {
    it('chiffre "INFORMATIQUE" avec [2, 4, 1, 3] => "NOIFMTRAQEIU" et inverse', () => {
      const params = { permutation: [2, 4, 1, 3] };
      const cipher = permutationAlgorithm.encrypt('INFORMATIQUE', params);
      expect(cipher).toBe('NOIFMTRAQEIU');
      expect(permutationAlgorithm.decrypt(cipher, params)).toBe('INFORMATIQUE');
    });

    it('chiffre "SECURITE" avec [3, 5, 1, 4, 2] => "CRSUEEXIXT" (paddingLength: 2) et inverse', () => {
      const params = { permutation: [3, 5, 1, 4, 2] };
      const cipher = permutationAlgorithm.encrypt('SECURITE', params);
      expect(cipher).toBe('CRSUEEXIXT');

      const paddingLength = getPaddingLength('SECURITE'.length, 5);
      expect(paddingLength).toBe(2);
      expect(permutationAlgorithm.decrypt(cipher, { ...params, paddingLength })).toBe('SECURITE');
    });

    // À compléter avec le module de cryptanalyse
    it.todo(
      'déchiffre par cryptanalyse le texte "OEDCNEMUT" (à compléter avec le module de cryptanalyse)',
    );
    // 8 caractères, non divisible par 3 : vérifier la taille de bloc dans l'énoncé du TD
    it.todo(
      'déchiffre par cryptanalyse le texte "OBNOUJRU" (8 caractères, non divisible par 3 : vérifier la taille de bloc dans l\'énoncé du TD - à compléter avec le module de cryptanalyse)',
    );
  });

  describe('Chiffre de Vigenère', () => {
    it('chiffre "BONJOUR" avec clé "CLE" => "DZRLZYT" et inverse', () => {
      const params = { key: 'CLE' };
      const cipher = vigenereAlgorithm.encrypt('BONJOUR', params);
      expect(cipher).toBe('DZRLZYT');
      expect(vigenereAlgorithm.decrypt(cipher, params)).toBe('BONJOUR');
    });

    it('chiffre "SECURITE" avec clé "INFO" => "ARHIZVYS" et inverse', () => {
      const params = { key: 'INFO' };
      const cipher = vigenereAlgorithm.encrypt('SECURITE', params);
      expect(cipher).toBe('ARHIZVYS');
      expect(vigenereAlgorithm.decrypt(cipher, params)).toBe('SECURITE');
    });

    // À compléter avec le module de cryptanalyse
    it.todo(
      'déchiffre par cryptanalyse le texte "LXFOPVEFRNHR" avec longueur de clé 5 (à compléter avec le module de cryptanalyse)',
    );
  });
});
