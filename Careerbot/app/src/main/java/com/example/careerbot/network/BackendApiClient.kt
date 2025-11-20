package com.example.careerbot.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object BackendApiClient {
    // Backend API is running on port 3001
    // For local testing on Android emulator, use: http://10.0.2.2:3001/api/
    // For local testing on physical device, use: http://YOUR_LOCAL_IP:3001/api/
  //  private const val BASE_URL = "http://10.0.2.2:3001/api/"
    private const val BASE_URL = "https://carrier-guidance-backend-1.onrender.com/api/"
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val backendService: BackendService = retrofit.create(BackendService::class.java)
}
