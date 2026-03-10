import { FC } from "react";

export const WelcomePage: FC = () => {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to OffRecord</h1>
        <p className="text-gray-700 text-lg mb-6">
          OffRecord is a real-time messaging application written in Spring Boot using the STOMP protocol.
        </p>
        <a
          href="/login"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Proceed to login
        </a>
      </div>
    </div>
  );
};
