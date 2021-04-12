import { NestFactory } from '@nestjs/core';
import { Module, Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const APP_PORT = 5004;

const timeSubject = new Subject<{ result: string }>();
setInterval(() => {
    const result = 'Ленинградское время 00 часов 00 минут :)';
    timeSubject.next({ result });
}, 5000);

@Controller()
class TestTimeController {
    @GrpcMethod('issuance.DCRedemptionManagerService', 'GetTimeStream')
    public getTimeStream(): Observable<{ result: string }> {
        console.log('GetTimeStream call !!!');
        return timeSubject.asObservable();
    }
}

@Module({
    controllers: [TestTimeController],
})
class AppModule {}


(async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.GRPC,
        options: {
            url: `0.0.0.0:${APP_PORT}`,
            package: 'atmz.web',
            protoPath: join(process.cwd(), 'proto.proto'),
        },
    });

    await app.listenAsync();
})();
