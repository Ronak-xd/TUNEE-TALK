import { useClerk } from "@clerk/clerk-react";
import { Button } from "./ui/button";

const SignInOAuthButtons = () => {
	const { openSignIn } = useClerk();

	const handleSignInClick = () => {
		openSignIn({
			redirectUrl: "/auth-callback", // After login, Clerk redirects here
		});
	};

	return (
		<Button
			onClick={handleSignInClick}
			variant={"secondary"}
			className='w-full text-white border-zinc-200 h-11'
		>
			<img src='/login.png' alt='Google' className='size-5 mr-2' />
			Login
		</Button>
	);
};

export default SignInOAuthButtons;
