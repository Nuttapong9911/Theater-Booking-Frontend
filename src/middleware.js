import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux'

export default function withAuth(Component) {
  return function ProtectedRoute({ ...props }) {
    const router = useRouter()

    const storedToken = useSelector((state) => state.token.value)
    const { role } = storedToken
    console.log(role)

    useEffect(() => {
      if (role !== 'admin') {
        alert('Only admin is allowed to configure system!')
        router.push('/');
      }
    }, [role, router]);

    return <Component {...props} />;
  };
}