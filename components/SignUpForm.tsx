'use client'
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form"
import { useSignUp } from "@clerk/nextjs"
import { z } from 'zod' ;
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import {Button, ButtonGroup} from "@heroui/button";
import { Input } from "@heroui/input";
import {
    Mail,
    Lock,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
  } from "lucide-react";

//zod custom schema
import { signupSchema } from "@/schemas/signUpSchema";
import Link from "next/link";


export default function SignUpForm() {
    
    const router = useRouter() ;
    const [verifying,setVerifying] = useState(false) ;
    const [isSubmitting,setIsSubmitting] = useState(false) ;
    const [showPassword,setShowPassword] = useState(false);
    const [showConfirmPassword,setShowConfirmPassword] = useState(false);
    const [authError,setAuthError] = useState<string | null>(null)
    const [verificationCode,setVerificationCode] = useState("") ;
    const [verificationError,setVerificationError] = useState<string | null>(null) ;
    const {signUp,isLoaded,setActive} = useSignUp()
    
    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof signupSchema>)=>  {
    // When your page first loads (especially in Next.js), components may render before Clerk has fully loaded on the client side.
    // To avoid errors, isLoaded tells you:
    // "Hey! Wait… I’m not ready yet!"
        if(!isLoaded) return; //didnot understand
        setIsSubmitting(true);
        setAuthError(null);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setVerifying(true) ;
        } catch (error: any) {
            console.error("Signup error: ",error)
            setAuthError(
                error.errors?.[0]?.message || "An error has occurred during the signup. Please try again"
            )
        } finally{
            setIsSubmitting(false);
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>)=>  {
        if(!isLoaded || !signUp) return ;
        setIsSubmitting(true);
        setAuthError(null);
        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode
            })
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId})
                router.push('/dashboard')
            }else {
                console.error("Verification incomplete", result) ;
                setVerificationError("Verification could not be completed!")
            }
        } catch (error: any) {
            console.error("Verification incomplete", error) ;
            setVerificationError(error.errors?.[0]?.message || "An error has occurred during the signup. Please try again")
        } finally {
            setIsSubmitting(false);
        }
    }

    if(verifying) {
        return (
            <Card>
                <CardHeader>
                    <h1>Verify your mail</h1>
                    <p>We've sent a verification code to your email</p>
                </CardHeader>
                <Divider/>
                <CardBody>
                    {verificationError && (
                        <div>
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <p>{verificationError}</p>
                        </div>
                    )}

                    {/* why not here */}
                    <form onSubmit={handleVerificationSubmit}> 
                        <div>
                            <label htmlFor="verificationCode">Verification Code</label>
                            <Input
                                id="verificationCode"
                                type="text"
                                placeholder="Enter the 6-digit code"
                                value={verificationCode}
                                onChange={(e)=>setVerificationCode(e.target.value)}
                                className="w-full"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            color="primary"
                            className="w-full"
                            isLoading={isSubmitting}
                        >
                            {isSubmitting? "Verifying...":"Verify Email"}
                        </Button>
                    </form>

                    <div>
                        <p>
                            Didn't receive the code?{" "}
                            <button
                                onClick={async()=> {
                                    if(signUp){
                                        await signUp.prepareEmailAddressVerification({
                                            strategy: "email_code",
                                        });
                                    }
                                }}
                                className=""
                            >Resend code</button>
                        </p>
                    </div>
                </CardBody>
            </Card>
            
        )
    }

    return (
        <Card>
            <CardHeader>
                <h1>Create Your Account</h1>
                <p>Sign up to start managing your images securely</p>
            </CardHeader>
            <Divider/>
            <CardBody>
                {authError && (
                    <div>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{authError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="">Email</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            startContent={<Mail className="h-4 w-4 text-default-500" />}
                            isInvalid={!!errors.email} //It’s called double negation.It’s a trick to convert any value into a true or false (boolean).
                            errorMessage={errors.email?.message}
                            {...register("email")}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="">Password</label>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-default-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-default-500" />
                                )}
                                </Button>
                            }
                            isInvalid={!!errors.password}
                            errorMessage={errors.password?.message}
                            {...register("password")}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="passwordConfirmation">Confirm Password</label>
                        <Input
                            id="passwordConfirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            startContent={<Lock className="h-4 w-4 text-default-500" />}
                            endContent={
                                <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                type="button"
                                >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-default-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-default-500" />
                                )}
                                </Button>
                            }
                            isInvalid={!!errors.passwordConfirmation} //when isInvalid is true , errorMessage is displayed
                            errorMessage={errors.passwordConfirmation?.message}
                            {...register("passwordConfirmation")}
                            className="w-full"
                        />
                    </div>
                    {/* ..................... */}
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-sm text-default-600">
                            By signing up, you agree to our Terms of Service and Privacy
                            Policy
                        </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        color="primary"
                        className="w-full"
                        isLoading={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                </form>
            </CardBody>
            <Divider />

            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-default-600">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="text-primary hover:underline font-medium"
                >
                    Sign in
                </Link>
                </p>
            </CardFooter>
        </Card>
    )

}