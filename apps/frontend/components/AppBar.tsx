"use client"
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function AppBar()
   {
    return (
            <div className="flex justify-end items-center p-4 gap-4 h-16">
              <div>DeUptime</div>
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
          </div>
    )
  }