'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogs } from '@/hooks/useCatalogs';
import { getMyPreferences, updateMyPreferences, updateMyAccount, updateMyPassword, deactivateMyAccount } from '@/lib/api/users';
import { ApiError } from '@/lib/api/client';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const inputClassName =
  'flex-1 rounded-lg border px-3 py-[7px] text-[13px] focus:outline-none focus:ring-2 focus:ring-offset-0 border-bg-tertiary focus:ring-text-tertiary/20 focus:border-text-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed';
const inputStyle = { backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' };
const saveButtonClassName =
  'px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';
const saveButtonStyle = { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' };

export default function SettingsPage() {
  const { ready, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const { catalogs, loading: loadingCatalogs, error: catalogsError } = useCatalogs();

  const [defaultDifficultyId, setDefaultDifficultyId] = useState<number | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const fetchPreferences = async () => {
      setLoadingPreferences(true);
      setError(null);
      try {
        const data = await getMyPreferences();
        setDefaultDifficultyId(data.defaultDifficultyId);
      } catch (err) {
        console.error('Error al cargar las preferencias:', err);
        setError('No se pudieron cargar tus preferencias.');
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchPreferences();
  }, [ready, isLoggedIn, router]);

  const handleSelectDifficulty = async (difficultyId: number) => {
    setSaving(true);
    setError(null);
    try {
      const data = await updateMyPreferences(difficultyId);
      setDefaultDifficultyId(data.defaultDifficultyId);
    } catch (err) {
      console.error('Error al guardar la preferencia:', err);
      setError('No se pudo guardar tu preferencia.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccount = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername && !trimmedEmail) {
      setAccountError('Ingresá al menos un campo para actualizar.');
      return;
    }

    setSavingAccount(true);
    setAccountError(null);
    setAccountSuccess(null);
    try {
      await updateMyAccount({
        ...(trimmedUsername && { username: trimmedUsername }),
        ...(trimmedEmail && { email: trimmedEmail }),
      });
      setAccountSuccess('Datos actualizados correctamente.');
      setUsername('');
      setEmail('');
    } catch (err) {
      console.error('Error al actualizar la cuenta:', err);
      setAccountError(err instanceof ApiError ? err.message : 'No se pudieron actualizar los datos.');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Completá ambos campos de contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateMyPassword(currentPassword, newPassword);
      setPasswordSuccess('Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      setPasswordError(err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError(null);
    try {
      await deactivateMyAccount();
      await logout();
    } catch (err) {
      console.error('Error al eliminar la cuenta:', err);
      setDeactivateError(err instanceof ApiError ? err.message : 'No se pudo eliminar la cuenta.');
      setDeactivating(false);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        {ready && isLoggedIn && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1
                className="text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Configuración
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Dificultad por defecto al empezar a practicar.
              </p>
            </div>

            {catalogsError && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-error)' }}
              >
                {catalogsError}
              </p>
            )}

            {(loadingCatalogs || loadingPreferences) && !catalogsError && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Cargando preferencias...
              </p>
            )}

            {error && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-error)' }}
              >
                {error}
              </p>
            )}

            {!loadingCatalogs && !loadingPreferences && !catalogsError && catalogs.difficulties.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {catalogs.difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => handleSelectDifficulty(diff.id)}
                    disabled={saving}
                    className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      backgroundColor:
                        defaultDifficultyId === diff.id
                          ? 'var(--color-accent)'
                          : 'var(--color-bg-secondary)',
                      color:
                        defaultDifficultyId === diff.id
                          ? 'var(--color-bg-primary)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t pt-8 space-y-6" style={{ borderColor: 'var(--color-bg-tertiary)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Cuenta
              </h2>

              <form onSubmit={handleUpdateAccount} className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Cambiar nombre de usuario o email. Dejá en blanco lo que no quieras cambiar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nuevo nombre de usuario"
                    disabled={savingAccount}
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nuevo email"
                    disabled={savingAccount}
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <button type="submit" disabled={savingAccount} className={saveButtonClassName} style={saveButtonStyle}>
                    Guardar
                  </button>
                </div>
                {accountError && (
                  <p className="text-sm" style={{ color: 'var(--color-error)' }}>{accountError}</p>
                )}
                {accountSuccess && (
                  <p className="text-sm" style={{ color: 'var(--color-success)' }}>{accountSuccess}</p>
                )}
              </form>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Cambiar contraseña.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Contraseña actual"
                    disabled={savingPassword}
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contraseña nueva"
                    disabled={savingPassword}
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirmar contraseña nueva"
                    disabled={savingPassword}
                    className={inputClassName}
                    style={inputStyle}
                  />
                  <button type="submit" disabled={savingPassword} className={saveButtonClassName} style={saveButtonStyle}>
                    Cambiar contraseña
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm" style={{ color: 'var(--color-error)' }}>{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm" style={{ color: 'var(--color-success)' }}>{passwordSuccess}</p>
                )}
              </form>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deactivating}
                  className="px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-error)',
                  }}
                >
                  Eliminar cuenta
                </button>
                {deactivateError && (
                  <p className="text-sm" style={{ color: 'var(--color-error)' }}>{deactivateError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="¿Eliminar tu cuenta?"
        description="Esta acción desactiva tu cuenta de forma permanente: no vas a poder volver a iniciar sesión con ella. Se cerrará tu sesión inmediatamente."
        confirmLabel="Eliminar cuenta"
        cancelLabel="Cancelar"
        onConfirm={() => { setShowDeleteModal(false); void handleDeactivate(); }}
        onCancel={() => setShowDeleteModal(false)}
      />

      <Footer />
    </div>
  );
}
